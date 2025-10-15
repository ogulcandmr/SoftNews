// Script to convert Netlify functions to Vercel
const fs = require('fs');
const path = require('path');

const netlifyDir = './netlify/functions';
const vercelDir = './api';

// Ensure api directory exists
if (!fs.existsSync(vercelDir)) {
  fs.mkdirSync(vercelDir, { recursive: true });
}

// Files to convert
const files = ['youtube.js', 'forum.js', 'auth.js', 'social-auth.js', 'password-reset.js'];

files.forEach(file => {
  const netlifyPath = path.join(netlifyDir, file);
  const vercelPath = path.join(vercelDir, file);
  
  if (!fs.existsSync(netlifyPath)) {
    console.log(`Skipping ${file} - not found`);
    return;
  }
  
  let content = fs.readFileSync(netlifyPath, 'utf8');
  
  // Convert exports.handler to export default
  content = content.replace(/exports\.handler\s*=\s*async\s*function\s*\(event\)\s*{/, 
    'export default async function handler(req, res) {');
  
  // Convert event.httpMethod to req.method
  content = content.replace(/event\.httpMethod/g, 'req.method');
  
  // Convert event.body to req.body
  content = content.replace(/event\.body/g, 'req.body');
  
  // Convert event.path to req.url
  content = content.replace(/event\.path/g, 'req.url');
  
  // Convert event.headers to req.headers
  content = content.replace(/event\.headers/g, 'req.headers');
  
  // Convert return { statusCode, headers, body } to res.status().json()
  content = content.replace(
    /return\s*{\s*statusCode:\s*(\d+),\s*headers,\s*body:\s*JSON\.stringify\(([^)]+)\)\s*}/g,
    'return res.status($1).json($2)'
  );
  
  content = content.replace(
    /return\s*{\s*statusCode:\s*(\d+),\s*headers,\s*body:\s*([^}]+)\s*}/g,
    'return res.status($1).send($2)'
  );
  
  // Convert return { statusCode, body } to res.status().send()
  content = content.replace(
    /return\s*{\s*statusCode:\s*(\d+),\s*body:\s*([^}]+)\s*}/g,
    'return res.status($1).send($2)'
  );
  
  // Add CORS headers at the beginning of handler
  const corsSetup = `
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Content-Type', 'application/json');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
`;
  
  content = content.replace(
    /export default async function handler\(req, res\) {/,
    `export default async function handler(req, res) {${corsSetup}`
  );
  
  // Remove require statements for database (won't work in Vercel)
  content = content.replace(/const db = require\([^)]+\);?\n?/g, '// Database removed for Vercel\n');
  
  fs.writeFileSync(vercelPath, content);
  console.log(`✅ Converted ${file}`);
});

console.log('\n🎉 All functions converted!');
console.log('\n⚠️  Note: Database functions removed - you may need to adjust logic');
