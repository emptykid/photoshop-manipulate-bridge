# Photoshop Manipulate Bridge

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

A Photoshop Generator plugin that **starts an HTTP server inside Photoshop**. External programs can talk to and control Photoshop over HTTP/WebSocket—automate tasks, execute JSX, get document info, and more.

## What it does

- **Runs inside Photoshop** as a Generator plugin
- **Starts an HTTP server** (default port **8020**) when Photoshop launches
- **Exposes HTTP + WebSocket APIs** so any external tool (scripts, apps, CLI) can:
  - Execute JSX in Photoshop
  - Get document/layer info
  - Trigger actions and receive events
  - Control Photoshop from the command line or another app

Use it to build automation, integrations, or remote control from your own software.

## Prerequisites

- **Node.js 18+**
- **Adobe Photoshop CC** or later, with **Generator** enabled  
  (Preferences → Plug-ins → Enable Generator, then restart Photoshop)

## Quick start

### 1. Install the plugin

**Option A – Use the release installer (recommended)**

- **macOS**: Run `release/photoshop-manipulate-bridge-*.pkg`  
  Installs to: `/Library/Application Support/Adobe/Plug-Ins/CC/Generator/photoshop-manipulate-bridge`
- **Windows**: Run `release/PhotoshopManipulateBridge-Setup-*.exe`  
  Installs to: `%COMMONPROGRAMFILES%\Adobe\Plug-Ins\CC\Generator\photoshop-manipulate-bridge`

**Option B – Build from source**

```bash
npm install
npm run build
```

Then copy the `dist/` folder (as `photoshop-manipulate-bridge`) into:

- **macOS**: `~/Library/Application Support/Adobe/Adobe Photoshop [Version]/Plug-ins/Generator/`
- **Windows**: `%COMMONPROGRAMFILES%\Adobe\Plug-Ins\CC\Generator\`

### 2. Enable Generator and restart Photoshop

Preferences → Plug-ins → check **Enable Generator** → restart Photoshop.

### 3. Use the HTTP API

Once Photoshop is running with the plugin loaded, the server is available at **http://localhost:8020**.

```bash
# Check server status
curl http://localhost:8020/status

# Execute JSX (e.g. show alert)
curl -X POST http://localhost:8020/execute \
  -H "Content-Type: application/json" \
  -d '{"script": "alert(\"Hello from HTTP\");"}'
```

Open **http://localhost:8020** in a browser for a simple web dashboard.

## API overview

| Interface   | URL / protocol        | Use case                          |
|------------|------------------------|-----------------------------------|
| **HTTP**   | `http://localhost:8020` | REST-style calls from any client  |
| **WebSocket** | `ws://localhost:8020` | Real-time two-way communication   |

### HTTP endpoints

| Method | Path     | Description        |
|--------|----------|--------------------|
| GET    | `/`      | Web dashboard      |
| GET    | `/status`| Server status      |
| POST   | `/execute` | Execute JSX or actions (JSON body) |

### WebSocket messages

- `ping` – test connection  
- `alert` – show alert in Photoshop  
- `executeJSX` – run JSX script  
- `getDocumentInfo` – get document information  

See the `examples/` directory for sample clients (HTTP, WebSocket, JSX).

## Project structure

```
photoshop-manipulate-bridge/
├── src/
│   ├── index.ts        # Plugin entry, starts HTTP server
│   ├── generator.ts    # Generator API types
│   ├── server.ts       # HTTP + WebSocket server
│   └── utils/
│       └── logger.ts
├── dist/               # Build output (after npm run build)
├── examples/           # Sample clients and scripts
├── scripts/            # Packaging (macOS pkg, Windows NSIS)
├── release/            # Built installers (.pkg, .exe)
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Development

```bash
# Install dependencies
npm install

# Watch build
npm run dev

# Production build
npm run build

# Type check
npm run type-check

# Lint
npm run lint
```

## Packaging (build installers)

Installers are built from the `dist/` output and install the plugin into the Adobe Generator folder.

| Platform | Command / script           | Output |
|----------|----------------------------|--------|
| **macOS** | `npm run pack:mac` or `./scripts/build-mac-pkg.sh` | `release/photoshop-manipulate-bridge-*.pkg` |
| **Windows** | `scripts\build-win-installer.cmd` (or `npm run pack:win` with NSIS) | `release/PhotoshopManipulateBridge-Setup-*.exe` |

- **macOS**: Uses system `pkgbuild`.  
- **Windows**: Requires [NSIS](https://nsis.sourceforge.io/Download); run from Windows or use WSL/Git Bash with `makensis` in PATH.

Details: see [scripts/PACKAGING.md](scripts/PACKAGING.md).

## License

[MIT](LICENSE)
