# Photoshop Manipulate Bridge

A Photoshop Generator plugin built with TypeScript and Vite.

## Prerequisites

- Node.js 18+
- Adobe Photoshop CC or later with Generator enabled

## Setup

1. Install dependencies:
```bash
npm install
```

2. Build the plugin:
```bash
npm run build
```

This will:
- Compile TypeScript to JavaScript
- Bundle the code with Vite
- Generate `dist/package.json` with required dependencies
- Install production dependencies (`ws`) in `dist/node_modules/`

**Note:** The `dist/` directory is a complete, standalone plugin package with all dependencies bundled.

3. Enable Photoshop Generator:
   - Open Photoshop
   - Go to `Preferences > Plug-ins`
   - Check "Enable Generator"
   - Restart Photoshop

4. Install the plugin:
   - Copy or symlink the **entire project directory** (not just dist/) to Photoshop's Generator plugins folder:
     - **macOS**: `~/Library/Application Support/Adobe/Adobe Photoshop [Version]/Plug-ins/Generator/`
   - Or use the dist directory directly:
     - Copy/symlink the `dist` folder to the Generator plugins directory

## Development

- **Development mode** (watch for changes):
```bash
npm run dev
```

- **Type checking**:
```bash
npm run type-check
```

- **Linting**:
```bash
npm run lint
```

- **Build for production**:
```bash
npm run build
```

## Project Structure

```
photoshop-manipulate-bridge/
├── src/
│   ├── index.ts           # Plugin entry point
│   ├── generator.ts       # Generator API type definitions
│   └── utils/
│       └── logger.ts      # Logging utility
├── dist/                  # Build output (standalone, no node_modules)
│   ├── index.js          # Bundled plugin code (~120KB, includes ws)
│   ├── index.js.map      # Source map
│   └── package.json      # Plugin descriptor
├── package.json           # NPM package config
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Features

### WebSocket & HTTP Server

The plugin automatically starts a server on port **8020** that provides:

- **WebSocket interface** (`ws://localhost:8020`) - Real-time bidirectional communication
- **HTTP API** (`http://localhost:8020`) - RESTful interface for external tools
- **Web dashboard** - Visit `http://localhost:8020` in your browser

### Generator Events

The plugin listens to the following Photoshop events:

- `imageChanged` - Fired when the image content changes
- `currentDocumentChanged` - Fired when the active document changes
- `generatorMenuChanged` - Fired when Generator menu is changed

## API Reference

### Server API

#### HTTP Endpoints

**GET /** - Web dashboard

**GET /status** - Server status
```bash
curl http://localhost:8020/status
```

**POST /execute** - Execute JSX or actions
```bash
# Send alert
curl -X POST http://localhost:8020/execute \
  -H "Content-Type: application/json" \
  -d '{"action": "alert", "message": "Hello"}'

# Execute JSX
curl -X POST http://localhost:8020/execute \
  -H "Content-Type: application/json" \
  -d '{"script": "alert(\"Hello\");"}'
```

#### WebSocket Actions

- `ping` - Test connection
- `alert` - Show alert in Photoshop
- `executeJSX` - Execute JSX script
- `getDocumentInfo` - Get document information

See `examples/` directory for client examples.

### Generator Methods

- `generator.onPhotoshopEvent(event, handler)` - Register event handler
- `generator.addMenuItem(id, label, enabled, checked)` - Add menu item
- `generator.evaluateJSXString(script)` - Execute JSX script
- `generator.getDocumentInfo(documentId)` - Get document information
- `generator.getLayerInfo(documentId, layerId)` - Get layer information

## License

MIT
