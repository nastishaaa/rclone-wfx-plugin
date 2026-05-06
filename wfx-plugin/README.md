# RClone WFX Plugin 🚀

[![Build Status](https://img.shields.io/badge/build-passed-brightgreen.svg?style=flat-square)](https://github.com/nastishaaa/rclone-wfx-plugin)
[![Platform](https://img.shields.io/badge/platform-windows%20%7C%20linux-lightgrey.svg?style=flat-square)](https://github.com/nastishaaa/rclone-wfx-plugin)
[![License](https://img.shields.io/badge/license-Apache--2.0-blue.svg?style=flat-square)](LICENSE)

A high-performance File System (WFX) plugin for **Total Commander** and **Double Commander**. RClone WFX bridges the gap between your favorite file manager and 40+ cloud storage providers by leveraging the power of the [Rclone](https://rclone.org/) engine.

---

## ✨ Key Features

- **⚡ Ultra-low Latency**: Optimized wrapper ensures minimal overhead between Total Commander's API and the Rclone backend.
- **🛡️ Secure Authentication**: Uses battle-tested OAuth flows. Your credentials stay encrypted in your local Rclone config.
- **📂 Virtual Mapping**: Mount cloud remotes as virtual drives, enjoying native-like file operations (Copy, Move, Delete, Rename).
- **⚙️ Multithreaded I/O**: Concurrent file listings and background transfers keep the UI responsive.
- **🌐 40+ Remotes**: Support for Google Drive, S3, Dropbox, OneDrive, SFTP, and many more.

---

## 🛠️ Architecture

The plugin acts as a stateful intermediary:
`Total Commander (WFX API) <--> RClone WFX Plugin (C++/Go) <--> Rclone Engine <--> Cloud Infrastructure`

---

## 📥 Installation

### 1. Prerequisite: Rclone
Ensure Rclone is installed and accessible via your system's `PATH`.
```bash
# Using winget
winget install Rclone.Rclone
```

### 2. Plugin Setup
1. Download the latest release from [GitHub Releases](https://github.com/nastishaaa/rclone-wfx-plugin/releases).
2. Extract the `.wfx` (or `.wfx64`) file.
3. In Total Commander:
   - Go to `Configuration` > `Options` > `Plugins`.
   - Click `Configure` under `File System Plugins (.WFX)`.
   - Click `Add` and select the extracted file.

---

## ⚙️ Configuration

### Instant Google Drive Setup
Adding Google Drive is remarkably simple:
1. Open the plugin in your file manager (`Network Neighborhood` -> `RClone`).
2. Click the **"Configure Rclone"** button.
3. The plugin will handle the remote handshake automatically.

### Manual CLI Setup
You can also manage remotes via the Rclone terminal:
```bash
rclone config
```

- **Config Path**: `%AppData%/rclone/rclone.conf`
- **Logs**: `rclone-wfx.log` (Enabled in debug mode)

---

## ❓ Troubleshooting

- **"rclone not found"**: Ensure the `rclone.exe` directory is in your Windows environment variables (`PATH`).
- **Empty file list**: Verify remote connectivity with `rclone ls [remote]:` in a terminal.
- **Slow transfers**: Check your network overhead or Rclone's `--transfers` setting.

---

## 🤝 Contributing & Support

Contributions are welcome! If you encounter bugs or have feature requests, please open an [issue](https://github.com/nastishaaa/rclone-wfx-plugin/issues).

**Created with ❤️ for the Total Commander community.**
