const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'dist', 'assets');
const destDir = path.join(__dirname, 'public');

const files = fs.readdirSync(srcDir).filter(f => f.startsWith('WhatsApp') && f.endsWith('.jpeg'));

files.forEach((file, i) => {
    fs.copyFileSync(path.join(srcDir, file), path.join(destDir, `custom_img${i + 1}.jpeg`));
    console.log(`Copied ${file} to custom_img${i + 1}.jpeg`);
});
