import {
  App,
  FileSystemAdapter,
  Notice,
  Plugin,
  PluginSettingTab,
  Setting,
} from "obsidian";
import { dirname, join } from "path";
import { spawn } from "child_process";

interface OpenTerminalSettings {
  terminal: string;
}

const DEFAULT_SETTINGS: OpenTerminalSettings = {
  terminal: "powershell.exe",
};

export default class OpenTerminalPlugin extends Plugin {
  settings: OpenTerminalSettings;

  async onload() {
    await this.loadSettings();
    this.addSettingTab(new OpenTerminalSettingTab(this.app, this));

    // エディタの右クリックメニューに「Open terminal here」を追加
    this.registerEvent(
      this.app.workspace.on("editor-menu", (menu) => {
        menu.addItem((item) => {
          item
            .setTitle("Open terminal here")
            .setIcon("terminal")
            .onClick(() => this.openTerminal());
        });
      })
    );
  }

  private openTerminal() {
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

    const dir = dirname(join(adapter.getBasePath(), file.path));
    const terminal = this.settings.terminal || "powershell.exe";

    try {
      // Windows では spawn で直接起動してもウィンドウが表示されないため
      // cmd /c start 経由で新しいウィンドウとして起動する
      const proc = spawn("cmd.exe", ["/c", "start", terminal], {
        cwd: dir,
        detached: true,
        stdio: "ignore",
        windowsHide: false,
      });
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
        "The executable to launch. Examples: powershell.exe, pwsh, wt (Windows Terminal)"
      )
      .addText((text) =>
        text
          .setPlaceholder("powershell.exe")
          .setValue(this.plugin.settings.terminal)
          .onChange(async (value) => {
            this.plugin.settings.terminal = value.trim();
            await this.plugin.saveSettings();
          })
      );
  }
}
