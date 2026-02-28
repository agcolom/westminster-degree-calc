const fs = require('fs');
const path = require('path');
const { inlineSource } = require('inline-source');

async function processHTMLFile(inputFile, outputFile, outDir) {
  try {
    let html = fs.readFileSync(path.join(outDir, inputFile), 'utf8');

    // Remove basePath from all asset URLs for standalone version
    html = html.replace(/\/westminster-degree-calc\/_next/g, '_next');
    html = html.replace(/\/westminster-degree-calc\//g, '');

    // Add inline attributes to scripts and styles
    html = html.replace(/<link[^>]*\.css"[^>]*>/g, match =>
      match.replace(/rel="stylesheet"/, 'rel="stylesheet" inline')
    );
    html = html.replace(/<script[^>]*\.js"[^>]*>/g, match =>
      match.replace(/<script/, '<script inline')
    );

    // Convert font URLs to data URLs
    const fontFiles = fs.readdirSync(path.join(outDir, '_next/static/media'))
      .filter(file => file.endsWith('.woff2') || file.endsWith('.woff') || file.endsWith('.ttf'));

    for (const fontFile of fontFiles) {
      const fontPath = path.join('_next/static/media', fontFile);
      const fontData = fs.readFileSync(path.join(outDir, fontPath));
      const dataUrl = `data:font/${path.extname(fontFile).slice(1)};base64,${fontData.toString('base64')}`;
      html = html.replace(new RegExp(fontPath.replace(/\\/g, '/'), 'g'), dataUrl);
    }

    // Inline everything
    const result = await inlineSource(html, {
      compress: true,
      rootpath: outDir,
      attribute: 'inline',
    });

    fs.writeFileSync(path.join(outDir, outputFile), result);
    console.log(`Successfully created ${outputFile}`);
  } catch (err) {
    console.error(`Error processing ${inputFile}:`, err);
  }
}

async function processHTML() {
  const outDir = path.join(__dirname, 'out');

  // Create .nojekyll file for GitHub Pages to serve _next directory
  fs.writeFileSync(path.join(outDir, '.nojekyll'), '');
  console.log('Created .nojekyll file for GitHub Pages');

  // Process both UG and PG calculators
  await processHTMLFile('index.html', 'ugStandalone.html', outDir);
  await processHTMLFile('postgraduate.html', 'pgStandalone.html', outDir);
}

processHTML(); 