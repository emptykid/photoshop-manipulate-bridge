import { WebSocketServer, WebSocket } from 'ws';
import { createServer, IncomingMessage, ServerResponse } from 'http';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import { logger } from './utils/logger';
import { Generator } from './generator';

export class BridgeServer {
  private wss: WebSocketServer | null = null;
  private clients: Set<WebSocket> = new Set();
  private generator: Generator;
  private port: number;

  constructor(generator: Generator, port: number = 8020) {
    this.generator = generator;
    this.port = port;
  }

  /**
   * Start the WebSocket and HTTP server
   */
  start(): void {
    // Create HTTP server
    const server = createServer((req, res) => {
      this.handleHttpRequest(req, res);
    });

    // Create WebSocket server on top of HTTP server
    this.wss = new WebSocketServer({ server });

    this.wss.on('connection', (ws: WebSocket, req) => {
      this.handleWebSocketConnection(ws, req);
    });

    this.wss.on('error', (error) => {
      logger.error('WebSocket server error:', error);
    });

    server.listen(this.port, () => {
      logger.info(`Bridge server started on port ${this.port}`);
      logger.info(`WebSocket: ws://localhost:${this.port}`);
      logger.info(`HTTP: http://localhost:${this.port}`);
    });

    server.on('error', (error) => {
      logger.error('HTTP server error:', error);
    });
  }

  /**
   * Handle WebSocket connection
   */
  private handleWebSocketConnection(ws: WebSocket, req: IncomingMessage): void {
    const clientIp = req.socket.remoteAddress;
    logger.info(`WebSocket client connected from ${clientIp}`);

    this.clients.add(ws);

    // Send welcome message
    ws.send(JSON.stringify({
      type: 'connection',
      message: 'Connected to Photoshop Manipulate Bridge',
      timestamp: new Date().toISOString(),
    }));

    // Handle incoming messages
    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        logger.info('WebSocket message received:', message);
        await this.handleWebSocketMessage(ws, message);
      } catch (error) {
        logger.error('Error handling WebSocket message:', error);
        ws.send(JSON.stringify({
          type: 'error',
          message: 'Invalid message format',
          error: String(error),
        }));
      }
    });

    // Handle connection close
    ws.on('close', () => {
      logger.info(`WebSocket client disconnected from ${clientIp}`);
      this.clients.delete(ws);
    });

    // Handle errors
    ws.on('error', (error) => {
      logger.error('WebSocket client error:', error);
      this.clients.delete(ws);
    });
  }

  /**
   * Handle WebSocket messages
   */
  private async handleWebSocketMessage(ws: WebSocket, message: any): Promise<void> {
    const { action, data } = message;

    try {
      let result: any;

      switch (action) {
        case 'ping':
          result = { message: 'pong', timestamp: new Date().toISOString() };
          break;

        case 'alert':
          await this.executeJSX(`alert(${JSON.stringify(data.message || 'Hello from Bridge')});`);
          result = { success: true };
          break;

        case 'executeJSX':
          result = await this.executeJSX(data.script);
          break;

        case 'executeJSXFile':
          result = await this.executeJSXFile(data.file);
          break;

        case 'getDocumentInfo':
          result = await this.generator.getDocumentInfo(data.documentId);
          break;

        default:
          throw new Error(`Unknown action: ${action}`);
      }

      ws.send(JSON.stringify({
        type: 'response',
        action,
        result,
        timestamp: new Date().toISOString(),
      }));
    } catch (error) {
      ws.send(JSON.stringify({
        type: 'error',
        action,
        message: String(error),
        timestamp: new Date().toISOString(),
      }));
    }
  }

  /**
   * Handle HTTP requests
   */
  private handleHttpRequest(req: IncomingMessage, res: ServerResponse): void {
    const { method, url } = req;
    logger.info(`HTTP ${method} ${url}`);

    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (method === 'OPTIONS') {
      res.writeHead(204);
      res.end();
      return;
    }

    if (method === 'GET' && url === '/') {
      this.handleRootRequest(res);
    } else if (method === 'GET' && url === '/status') {
      this.handleStatusRequest(res);
    } else if (method === 'POST' && url?.startsWith('/execute')) {
      this.handleExecuteRequest(req, res);
    } else {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Not found' }));
    }
  }

  /**
   * Handle root request
   */
  private handleRootRequest(res: ServerResponse): void {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Photoshop Manipulate Bridge</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 40px; }
          h1 { color: #333; }
          .info { background: #f0f0f0; padding: 20px; border-radius: 5px; }
          code { background: #e0e0e0; padding: 2px 6px; border-radius: 3px; }
        </style>
      </head>
      <body>
        <h1>Photoshop Manipulate Bridge</h1>
        <div class="info">
          <h2>Server is running</h2>
          <p><strong>WebSocket:</strong> <code>ws://localhost:${this.port}</code></p>
          <p><strong>HTTP API:</strong> <code>http://localhost:${this.port}</code></p>
          <p><strong>Connected clients:</strong> ${this.clients.size}</p>
          <h3>Available Endpoints:</h3>
          <ul>
            <li>GET <code>/</code> - This page</li>
            <li>GET <code>/status</code> - Server status</li>
            <li>POST <code>/execute</code> - Execute JSX script</li>
          </ul>
        </div>
      </body>
      </html>
    `);
  }

  /**
   * Handle status request
   */
  private handleStatusRequest(res: ServerResponse): void {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'running',
      port: this.port,
      connectedClients: this.clients.size,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    }));
  }

  /**
   * Handle execute request
   */
  private handleExecuteRequest(req: IncomingMessage, res: ServerResponse): void {
    let body = '';

    req.on('data', (chunk) => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const data = JSON.parse(body);
        const { script, action, file } = data;

        let result: any;

        if (action === 'alert' && data.message) {
          await this.executeJSX(`alert(${JSON.stringify(data.message)});`);
          result = { success: true };
        } else if (file) {
          // Read and execute JSX file
          result = await this.executeJSXFile(file);
        } else if (script) {
          result = await this.executeJSX(script);
        } else {
          throw new Error('Missing script, file, or action parameter');
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: true,
          result,
          timestamp: new Date().toISOString(),
        }));
      } catch (error) {
        logger.error('Error executing request:', error);
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          success: false,
          error: String(error),
          timestamp: new Date().toISOString(),
        }));
      }
    });
  }

  /**
   * Execute JSX script in Photoshop
   */
  private async executeJSX(script: string): Promise<any> {
    logger.info('Executing JSX:', script);
    return await this.generator.evaluateJSXString(script);
  }

  /**
   * Read and execute JSX file in Photoshop
   */
  private async executeJSXFile(filePath: string): Promise<any> {
    try {
      // Resolve the file path (support both absolute and relative paths)
      const absolutePath = resolve(filePath);
      logger.info('Reading JSX file:', absolutePath);
      
      // Read the file content
      const script = readFileSync(absolutePath, 'utf-8');
      logger.info('Executing JSX from file:', filePath);
      
      // Execute the script
      return await this.generator.evaluateJSXString(script);
    } catch (error) {
      logger.error('Error reading or executing JSX file:', error);
      throw new Error(`Failed to execute JSX file: ${error}`);
    }
  }

  /**
   * Broadcast message to all connected WebSocket clients
   */
  broadcast(message: any): void {
    const data = JSON.stringify(message);
    this.clients.forEach((client) => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(data);
      }
    });
  }

  /**
   * Stop the server
   */
  stop(): void {
    if (this.wss) {
      this.clients.forEach((client) => client.close());
      this.wss.close(() => {
        logger.info('Bridge server stopped');
      });
    }
  }
}
