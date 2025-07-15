import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const port = process.env.PORT || 8080;
const distDir = join(__dirname, 'build');

// MIME types
const mimeTypes = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.ts': 'application/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.eot': 'application/vnd.ms-fontobject',
  '.map': 'application/json'
};

const server = createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Parse URL to remove query parameters
  const urlPath = req.url.split('?')[0];
  
  // Special handling for SPA routes (like /invite/...)
  const isAPIRoute = urlPath.startsWith('/api/');
  const isAssetRequest = urlPath.match(/\.(js|mjs|ts|css|png|jpg|jpeg|gif|svg|ico|json|woff|woff2|ttf|eot|map)$/);
  const isSPARoute = urlPath.startsWith('/invite/') || urlPath.startsWith('/friend/') || urlPath === '/friends' || urlPath === '/dashboard' || urlPath === '/auth';
  
  console.log(`Processing: ${urlPath}, isAsset: ${isAssetRequest}, isSPARoute: ${isSPARoute}`);
  
  // If it's a SPA route and NOT an asset, serve index.html
  if (isSPARoute && !isAssetRequest) {
    console.log(`SPA route detected: ${urlPath}, serving index.html`);
    const filePath = join(distDir, 'index.html');
    try {
      const content = readFileSync(filePath);
      res.writeHead(200, { 
        'Content-Type': 'text/html',
        'Cache-Control': 'no-cache'
      });
      res.end(content);
      return;
    } catch (error) {
      console.error(`Error serving index.html: ${error.message}`);
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Internal Server Error');
      return;
    }
  }
  
  let filePath = join(distDir, urlPath === '/' ? 'index.html' : urlPath);
  
  // Clean the file path to prevent directory traversal
  const normalizedPath = filePath.replace(/\.\./g, '');
  
  // Check if file exists
  if (existsSync(normalizedPath)) {
    filePath = normalizedPath;
  } else {
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
