# Open Terminal Here

An [Obsidian](https://obsidian.md) plugin that opens your preferred terminal at the current file's directory — with a single right-click.

## Features

- Open a terminal at the directory of the file you are currently editing
- Multiple ways to trigger (configurable in settings):
  - **Editor right-click menu** — right-click inside any note
  - **File explorer right-click menu** — right-click any file or folder
  - **Command palette** — always available as *Open terminal here*
  - **Ribbon button** — optional icon in the left sidebar
- Supports any terminal: Terminal, iTerm (macOS), PowerShell, pwsh, Windows Terminal (`wt`), and more

## Requirements

- Windows or macOS (desktop app)
- Obsidian 1.0.0 or later

## Installation

### Community plugins (recommended)

1. Open **Settings → Community plugins → Browse**
2. Search for **Open Terminal Here**
3. Click **Install**, then **Enable**

### Manual

1. Download `main.js` and `manifest.json` from the [latest release](../../releases/latest)
2. Copy them to `<your vault>/.obsidian/plugins/open-terminal-here/`
3. Reload Obsidian and enable the plugin under **Settings → Community plugins**

## Settings

| Setting | Default | Description |
|---|---|---|
| Terminal command | `Terminal` (macOS) / `powershell.exe` (Windows) | The terminal app to launch. macOS: `Terminal`, `iTerm` / Windows: `powershell.exe`, `pwsh`, `wt` |
| Editor right-click menu | On | Show *Open terminal here* in the editor context menu |
| File explorer right-click menu | Off | Show *Open terminal here* in the file explorer context menu |
| Ribbon button | Off | Show a terminal icon in the left ribbon (requires plugin reload) |

The **Command palette** entry (*Open terminal here*) is always registered. You can assign a hotkey to it via **Settings → Hotkeys**.

## License

[MIT](LICENSE)
