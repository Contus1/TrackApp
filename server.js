import { createServer } from 'http';
import { readFileSync, existsSync } from 'fs';
import { join, extname } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { gzip } from 'zlib';

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

// Helper function for compression
const compressResponse = (content, encoding, callback) => {
  if (encoding && encoding.includes('gzip')) {
    gzip(content, callback);
  } else {
    callback(null, content, false);
  }
};

const server = createServer((req, res) => {
  console.log(`Request: ${req.method} ${req.url}`);
  
  // Security headers
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  
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
      const acceptEncoding = req.headers['accept-encoding'] || '';
      
      compressResponse(content, acceptEncoding, (err, compressedContent, isCompressed) => {
        if (err) {
          console.error('Compression error:', err);
          res.writeHead(500, { 'Content-Type': 'text/plain' });
          res.end('Internal Server Error');
          return;
        }
        
        const headers = { 
          'Content-Type': 'text/html',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        };
        
        if (isCompressed) {
          headers['Content-Encoding'] = 'gzip';
        }
        
        res.writeHead(200, headers);
        res.end(compressedContent);
      });
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
    const acceptEncoding = req.headers['accept-encoding'] || '';
    
    // Determine cache strategy
    const isHTML = ext === '.html';
    const cacheControl = isHTML 
      ? 'no-cache, no-store, must-revalidate'
      : 'public, max-age=31536000, immutable';
    
    console.log(`Serving: ${filePath} (${mimeType})`);
    
    compressResponse(content, acceptEncoding, (err, compressedContent, isCompressed) => {
      if (err) {
        console.error('Compression error:', err);
        res.writeHead(500, { 'Content-Type': 'text/plain' });
        res.end('Internal Server Error');
        return;
      }
      
      const headers = { 
        'Content-Type': mimeType,
        'Cache-Control': cacheControl
      };
      
      if (isCompressed) {
        headers['Content-Encoding'] = 'gzip';
      }
      
      if (isHTML) {
        headers['Pragma'] = 'no-cache';
        headers['Expires'] = '0';
      }
      
      res.writeHead(200, headers);
      res.end(compressedContent);
    });
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
  console.log(`💾 Cache-Control: HTML=no-cache, Assets=1year`);
  console.log(`🗜️  Compression: gzip enabled`);
});
