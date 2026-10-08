const fs = require('fs');
const path = require('path');

function walk(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walk(dirPath, callback) : callback(path.join(dir, f));
    });
}

walk('./src', (filepath) => {
    if (!filepath.endsWith('.tsx') && !filepath.endsWith('.ts')) return;
    
    let content = fs.readFileSync(filepath, 'utf8');
    let original = content;

    // Remove `import React from 'react';`
    content = content.replace(/^import\s+React\s+from\s+['"]react['"];\s*$/gm, '');
    
    // Replace `import React, { useState } from 'react';` with `import { useState } from 'react';`
    content = content.replace(/import\s+React,\s*\{\s*(.*?)\s*\}\s*from\s+['"]react['"];/gm, "import { $1 } from 'react';");

    if (content !== original) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Updated React imports in ${filepath}`);
    }
});