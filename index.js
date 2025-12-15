const fs = require('fs');
const path = require('path');
const axios = require('axios');
const AdmZip = require('adm-zip');
const express = require('express');

const app = express();
const port = process.env.PORT || 9090;

// Status page
app.get("/", (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>KHAN BOT | ONLINE</title>
      <link href="https://fonts.googleapis.com/css2?family=Roboto+Mono&display=swap" rel="stylesheet">
      <style>
        * { box-sizing: border-box; }
        body { margin: 0; padding: 0; min-height: 100vh; display: flex; align-items: center; justify-content: center; font-family: 'Roboto Mono', monospace; background: linear-gradient(135deg, #0f2027, #203a43, #2c5364); color: #ffffff; }
        .card { background: rgba(0, 0, 0, 0.6); padding: 30px 25px; border-radius: 16px; text-align: center; box-shadow: 0 8px 32px rgba(0, 255, 128, 0.3); border: 1px solid #00ff99; width: 90%; max-width: 420px; }
        .card h1 { font-size: 1.8rem; color: #00ff99; margin-bottom: 10px; }
        .status-dot { display: inline-block; width: 12px; height: 12px; background-color: #00ff99; border-radius: 50%; margin-right: 8px; animation: pulse 2s infinite; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      </style>
    </head>
    <body>
      <div class="card">
        <h1><span class="status-dot"></span> KHAN BOT IS RUNNING</h1>
        <p>Powered by JawadTech</p>
      </div>
    </body>
    </html>
  `);
});

app.listen(port, () => console.log(`Status page running on port ${port}`));

// ✅ FIXED: Hyphen removed from variable name
const botZipUrl = 'https://github.com/JawadTechXD/KHAN-XD/archive/refs/heads/main.zip';

const tempPath = path.join(__dirname, '.temp_loader');

async function StartBot() {
  try {
    console.log('🔄 Fetching secure codes...');
    const response = await axios.get(botZipUrl, { responseType: 'arraybuffer' });
    const zip = new AdmZip(Buffer.from(response.data));

    fs.mkdirSync(tempPath, { recursive: true });
    zip.extractAllTo(tempPath, true);

    const folders = fs.readdirSync(tempPath).filter(f => fs.statSync(path.join(tempPath, f)).isDirectory());
    if (!folders.length) throw new Error('No folder extracted after unzip');

    const extractedFolder = path.join(tempPath, folders[0]);
    const indexPath = path.join(extractedFolder, 'index.js');

    if (!fs.existsSync(indexPath)) throw new Error('index.js not found in extracted folder');

    console.log('✅ Core loaded – Starting bot...');
    require(indexPath);

  } catch (err) {
    console.error('❌ Failed to load bot:', err.message);
    process.exit(1);
  } finally {
    setTimeout(() => {
      try {
        if (fs.existsSync(tempPath)) {
          fs.rmSync(tempPath, { recursive: true, force: true });
          console.log('🧹 Temporary files cleaned');
        }
      } catch (e) {}
    }, 8000);
  }
}

StartBot();
