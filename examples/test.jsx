// Example JSX script for Photoshop
// This script creates a new document and adds a text layer

try {
    // Create a new document
    var doc = app.documents.add(800, 600, 72, "Test Document", NewDocumentMode.RGB);
    
    // Add a text layer
    var textLayer = doc.artLayers.add();
    textLayer.kind = LayerKind.TEXT;
    textLayer.name = "Hello Layer";
    
    var textItem = textLayer.textItem;
    textItem.contents = "Hello from JSX file!";
    textItem.size = 48;
    textItem.position = [100, 100];
    
    // Return success message
    "Document created successfully with text layer";
} catch (e) {
    "Error: " + e.message;
}
