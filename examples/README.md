# Examples

This directory contains example clients for testing the Photoshop Manipulate Bridge.

## WebSocket Client

Open `websocket-client.html` in your web browser to test WebSocket connections.

**Features:**
- Connect/disconnect to the bridge
- Send ping messages
- Trigger alerts in Photoshop
- Get document information
- Execute custom JSX scripts
- View real-time logs

**Usage:**
```bash
open examples/websocket-client.html
```

## HTTP Client

Run the shell script to test HTTP API endpoints.

**Usage:**
```bash
chmod +x examples/http-client.sh
./examples/http-client.sh
```

## API Reference

### WebSocket Messages

#### Ping
```json
{
  "action": "ping"
}
```

Response:
```json
{
  "type": "response",
  "action": "ping",
  "result": {
    "message": "pong",
    "timestamp": "2024-01-28T07:00:00.000Z"
  }
}
```

#### Alert
```json
{
  "action": "alert",
  "data": {
    "message": "Hello from Bridge"
  }
}
```

#### Execute JSX
```json
{
  "action": "executeJSX",
  "data": {
    "script": "alert('Custom script');"
  }
}
```

#### Execute JSX File
```json
{
  "action": "executeJSXFile",
  "data": {
    "file": "/path/to/script.jsx"
  }
}
```

#### Get Document Info
```json
{
  "action": "getDocumentInfo",
  "data": {
    "documentId": 123
  }
}
```

### HTTP Endpoints

#### GET `/status`
Returns server status and statistics.

```bash
curl http://localhost:8020/status
```

#### POST `/execute`
Execute actions or JSX scripts.

```bash
curl -X POST http://localhost:8020/execute \
  -H "Content-Type: application/json" \
  -d '{"action": "alert", "message": "Hello"}'
```

Or execute custom JSX:

```bash
curl -X POST http://localhost:8020/execute \
  -H "Content-Type: application/json" \
  -d '{"script": "alert(\"Hello\");"}'
```

Or execute JSX from file:

```bash
curl -X POST http://localhost:8020/execute \
  -H "Content-Type: application/json" \
  -d '{"file": "/path/to/script.jsx"}'
```
