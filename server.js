import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = process.env.PORT || 8080;
const distDir = join(__dirname, 'dist');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json'
};

const server = createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  let filePath = join(distDir, req.url === '/' ? 'index.html' : req.url);
  
  // Clean the file path to prevent directory traversal
  const normalizedPath = filePath.replace(/\.\./g, '');
  
  // Check if file exists
  if (existsSync(normalizedPath)) {
    filePath = normalizedPath;
  } else {
    // Only serve index.html for routes that look like pages, not assets
    const isAssetRequest = req.url.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|json|woff|woff2|ttf|eot)$/);
    
    if (isAssetRequest) {
      // Asset not found - return 404
      console.log(`Asset not found: ${normalizedPath}`);
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Not Found');
      return;
    } else {
      // Route not found - serve index.html for SPA routing
      console.log(`Route not found: ${normalizedPath}, serving index.html for SPA routing`);
      filePath = join(distDir, 'index.html');
    }
  }

  try {
    const content = readFileSync(filePath);
    const ext = extname(filePath);
    const mimeType = mimeTypes[ext] || 'text/plain';
    
    console.log(`Serving: ${filePath} (${mimeType})`);
    res.writeHead(200, { 
      'Content-Type': mimeType,
      'Cache-Control': ext === '.html' ? 'no-cache' : 'public, max-age=31536000'
    });
    res.end(content);
  } catch (error) {
    console.error(`Error serving file: ${error.message}`);
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

server.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`📁 Serving files from: ${distDir}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
