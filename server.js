import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = process.env.PORT || 3000;

const MIME_TYPES = {
  '.html': 'text/html; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.mjs': 'application/javascript; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.json': 'application/json; charset=UTF-8',
  '.csv': 'text/csv; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url || '/';
  // Strip query string
  reqUrl = reqUrl.split('?')[0];

  if (reqUrl === '/') {
    reqUrl = '/index.html';
  }

  // Map public or data requests
  let filePath = path.join(__dirname, reqUrl);
  if (!fs.existsSync(filePath)) {
    // Try in public/
    const publicPath = path.join(__dirname, 'public', reqUrl);
    if (fs.existsSync(publicPath)) {
      filePath = publicPath;
    }
  }

  // Check if file exists
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';
    res.writeHead(200, {
      'Content-Type': contentType,
      'Access-Control-Allow-Origin': '*'
    });
    fs.createReadStream(filePath).pipe(res);
  } else {
    // Fallback to index.html for SPA routing
    const indexPath = path.join(__dirname, 'index.html');
    if (fs.existsSync(indexPath)) {
      res.writeHead(200, { 'Content-Type': 'text/html; charset=UTF-8' });
      fs.createReadStream(indexPath).pipe(res);
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('404 Not Found');
    }
  }
});

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🏥 PULSE-OPS: The Forgotten Patient Operations Monitor`);
  console.log(`======================================================`);
  console.log(`✓ Server running at: http://localhost:${PORT}`);
  console.log(`✓ Data sources available:`);
  console.log(`    - /data/patients.csv`);
  console.log(`    - /data/encounters.csv`);
  console.log(`    - /data/departments.csv`);
  console.log(`    - /data/diagnostic_tests.csv`);
  console.log(`    - /data/datasets.json`);
  console.log(`======================================================\n`);
});
