# 打包发布 (Packaging)

将 `dist` 构建产物打包成文件夹 **photoshop-manipulate-bridge**，并安装到 Adobe Generator 插件目录。

## 安装目标路径

| 平台 | 目标路径 |
|------|----------|
| **Windows (64-bit)** | `%COMMONPROGRAMFILES%\Adobe\Plug-Ins\CC\Generator\photoshop-manipulate-bridge`<br>（通常为 `C:\Program Files\Common Files\Adobe\Plug-Ins\CC\Generator\photoshop-manipulate-bridge`） |
| **macOS** | `/Library/Application Support/Adobe/Plug-Ins/CC/Generator/photoshop-manipulate-bridge` |

## 前置条件

- 已执行 `npm run build` 或由打包脚本自动执行
- **Windows**：已安装 [NSIS](https://nsis.sourceforge.io/Download)，并将 `makensis` 加入 PATH
- **macOS**：使用系统自带的 `pkgbuild`，无需额外安装

## 打包命令

在项目根目录执行：

### macOS 打 .pkg 安装包

```bash
npm run pack:mac
# 或
./scripts/build-mac-pkg.sh
```

- 产物：`release/photoshop-manipulate-bridge-<version>.pkg`
- 安装后文件位于：`/Library/Application Support/Adobe/Plug-Ins/CC/Generator/photoshop-manipulate-bridge/`

### Windows 打 NSIS 安装包

**在 Windows 上（推荐）：**

```cmd
scripts\build-win-installer.cmd
```

**在 Git Bash / WSL / macOS 上（需已安装 NSIS）：**

```bash
npm run pack:win
# 或
./scripts/build-win-installer.sh
```

- 产物：`release/PhotoshopManipulateBridge-Setup-<version>.exe`
- 安装后文件位于：`%COMMONPROGRAMFILES%\Adobe\Plug-Ins\CC\Generator\photoshop-manipulate-bridge\`

## 脚本说明

| 文件 | 说明 |
|------|------|
| `scripts/installer.nsi` | NSIS 安装脚本（Windows） |
| `scripts/build-mac-pkg.sh` | macOS：用 `pkgbuild` 生成 .pkg |
| `scripts/build-win-installer.sh` | Windows 构建脚本（Bash，跨平台） |
| `scripts/build-win-installer.cmd` | Windows 构建脚本（CMD，仅 Windows） |

## 构建流程

1. 执行 `npm run build` 生成 `dist/`
2. 将 `dist/` 内容放入目录 `photoshop-manipulate-bridge/`
3. **macOS**：按目标路径组织目录后调用 `pkgbuild` 生成 .pkg
4. **Windows**：将 `photoshop-manipulate-bridge/` 放入 `stage/win/`，由 NSIS 打包并安装到上述路径

`stage/` 与 `release/` 已加入 `.gitignore`，不会提交到仓库。
