import { Generator } from './generator';
import { logger } from './utils/logger';
import { BridgeServer } from './server';

// Store generator instance globally
let generatorInstance: Generator;
let bridgeServer: BridgeServer;

/**
 * Plugin entry point
 * This function is called by Photoshop Generator when the plugin is loaded
 */
export function init(generator: Generator): void {
  generatorInstance = generator;
  logger.info('Photoshop Manipulate Bridge Plugin initializing...');

  try {
    // Start WebSocket and HTTP server
    bridgeServer = new BridgeServer(generator, 8020);
    bridgeServer.start();

    // Add menu item
    generator.addMenuItem('photoshop-manipulate-bridge', 'Manipulate Bridge', true, false);
    logger.info('Menu item added: photoshop-manipulate-bridge');

    // Register event handlers
    generator.onPhotoshopEvent('imageChanged', handleImageChanged);
    generator.onPhotoshopEvent('currentDocumentChanged', handleDocumentChanged);
    generator.onPhotoshopEvent('generatorMenuChanged', handleMenuChanged);
    
    logger.info('Plugin initialized successfully');
  } catch (error) {
    logger.error('Failed to initialize plugin:', error);
  }
}

/**
 * Handle image changed event
 */
async function handleImageChanged(event: any): Promise<void> {
  logger.info('Image changed event received:', event);
  // Add your image manipulation logic here
}

/**
 * Handle document changed event
 */
async function handleDocumentChanged(documentId: number): Promise<void> {
  logger.info('Document changed:', documentId);
  // Add your document handling logic here
}

/**
 * Handle menu changed event
 */
async function handleMenuChanged(event: any): Promise<void> {
  logger.info('Menu changed event received:', event);
  
  // Check if our menu item was clicked
  if (event.generatorMenuChanged && event.generatorMenuChanged.name === 'photoshop-manipulate-bridge') {
    logger.info('Manipulate Bridge menu item clicked');
    // Show alert
    await showAlert('manipulate bridge is working properly');
  }
}

/**
 * Show alert in Photoshop
 */
async function showAlert(message: string): Promise<void> {
  if (generatorInstance && generatorInstance.evaluateJSXString) {
    const script = `alert(${JSON.stringify(message)});`;
    await generatorInstance.evaluateJSXString(script);
    logger.info('Alert shown:', message);
  } else {
    logger.warn('Generator not available for alert');
  }
}

// Export for CommonJS compatibility
export default { init };
