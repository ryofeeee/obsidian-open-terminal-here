import {
  App,
  FileSystemAdapter,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
  TAbstractFile,
  TFolder,
} from "obsidian";
import { dirname, join } from "path";
import { spawn } from "child_process";

interface OpenTerminalSettings {
  terminal: string;
  triggerEditorMenu: boolean;
  triggerFileMenu: boolean;
  triggerRibbon: boolean;
}

const DEFAULT_SETTINGS: OpenTerminalSettings = {
  terminal: process.platform === "darwin" ? "Terminal" : "powershell.exe",
  triggerEditorMenu: true,
  triggerFileMenu: false,
  triggerRibbon: false,
};

export default class OpenTerminalPlugin extends Plugin {
  settings: OpenTerminalSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new OpenTerminalSettingTab(this.app, this));

    // editor-menu: ハンドラ内でフラグをチェック → 設定変更が即時反映
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu) => {
        if (!this.settings.triggerEditorMenu) return;
        menu.addItem((item) => {
          item
            .setTitle("Open terminal here")
            .setIcon("terminal")
            .onClick(() => this.openTerminal());
        });
      })
    );

    // file-menu: TFile/TFolder 両対応、即時反映
    this.registerEvent(
      this.app.workspace.on("file-menu", (menu, abstractFile) => {
        if (!this.settings.triggerFileMenu) return;
        menu.addItem((item) => {
          item
            .setTitle("Open terminal here")
            .setIcon("terminal")
            .onClick(() => {
              const dir = this.resolveDir(abstractFile);
              if (dir) this.openTerminal(dir);
            });
        });
      })
    );

    // コマンド: 常時登録（ホットキーはObsidianのショートカット設定で割り当て可能）
    this.addCommand({
      id: "open-terminal-here",
      name: "Open terminal here",
      callback: () => this.openTerminal(),
    });

    // リボン: onload時のみ評価（変更後はプラグイン再読み込みが必要）
    if (this.settings.triggerRibbon) {
      this.addRibbonIcon("terminal", "Open terminal here", () => {
        this.openTerminal();
      });
    }
  }

  private resolveDir(abstractFile: TAbstractFile): string | null {
    const adapter = this.app.vault.adapter;
    if (!(adapter instanceof FileSystemAdapter)) {
      new Notice("This plugin only works with local vaults.");
      return null;
    }
    const basePath = adapter.getBasePath();
    if (abstractFile instanceof TFolder) {
      return join(basePath, abstractFile.path);
    }
    return dirname(join(basePath, abstractFile.path));
  }

  private openTerminal(dirOverride?: string) {
    let dir: string;

    if (dirOverride !== undefined) {
      dir = dirOverride;
    } else {
      const file = this.app.workspace.getActiveFile();
      if (!file) {
        new Notice("No file is currently open.");
        return;
      }
      const adapter = this.app.vault.adapter;
      if (!(adapter instanceof FileSystemAdapter)) {
        new Notice("This plugin only works with local vaults.");
        return;
      }
      dir = dirname(join(adapter.getBasePath(), file.path));
    }

    const terminal = this.settings.terminal || (process.platform === "darwin" ? "Terminal" : "powershell.exe");

    try {
      let proc;
      if (process.platform === "darwin") {
        proc = spawn("open", ["-a", terminal, dir], {
          detached: true,
          stdio: "ignore",
        });
      } else {
        proc = spawn("cmd.exe", ["/c", "start", terminal], {
          cwd: dir,
          detached: true,
          stdio: "ignore",
          windowsHide: false,
        });
      }
      proc.unref();
    } catch (e) {
      new Notice(`Failed to open terminal: ${e}`);
    }
  }

  async loadSettings() {
    this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
  }

  async saveSettings() {
    await this.saveData(this.settings);
  }
}

class OpenTerminalSettingTab extends PluginSettingTab {
  plugin: OpenTerminalPlugin;

  constructor(app: App, plugin: OpenTerminalPlugin) {
    super(app, plugin);
    this.plugin = plugin;
  }

  display(): void {
    const { containerEl } = this;
    containerEl.empty();

    containerEl.createEl("h2", { text: "Open Terminal Here" });

    new Setting(containerEl)
      .setName("Terminal command")
      .setDesc(
        "The terminal app to launch. Mac: Terminal, iTerm / Windows: powershell.exe, pwsh, wt"
      )
      .addText((text) =>
        text
          .setPlaceholder(process.platform === "darwin" ? "Terminal" : "powershell.exe")
          .setValue(this.plugin.settings.terminal)
          .onChange(async (value) => {
            this.plugin.settings.terminal = value.trim();
            await this.plugin.saveSettings();
          })
      );

    containerEl.createEl("h3", { text: "Trigger methods" });

    new Setting(containerEl)
      .setName("Editor right-click menu")
      .setDesc("Add 'Open terminal here' to the editor context menu.")
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.triggerEditorMenu)
          .onChange(async (value) => {
            this.plugin.settings.triggerEditorMenu = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("File explorer right-click menu")
      .setDesc(
        "Add 'Open terminal here' to the file explorer context menu. Works for both files and folders."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.triggerFileMenu)
          .onChange(async (value) => {
            this.plugin.settings.triggerFileMenu = value;
            await this.plugin.saveSettings();
          })
      );

    new Setting(containerEl)
      .setName("Command palette / Hotkey")
      .setDesc(
        "The command 'Open terminal here' is always registered. Assign a hotkey via Obsidian's Hotkeys settings."
      );

    new Setting(containerEl)
      .setName("Ribbon button")
      .setDesc(
        "Show a terminal button in the ribbon. Requires reloading the plugin after changing this setting."
      )
      .addToggle((toggle) =>
        toggle
          .setValue(this.plugin.settings.triggerRibbon)
          .onChange(async (value) => {
            this.plugin.settings.triggerRibbon = value;
            await this.plugin.saveSettings();
          })
      );
  }
}
