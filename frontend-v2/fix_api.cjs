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
    if (!filepath.endsWith('.ts') && !filepath.endsWith('.tsx')) return;
    
    let content = fs.readFileSync(filepath, 'utf8');
    let original = content;

    content = content.replace(/(apiClient\.(?:get|post|put|patch|delete))\((['"`])\/(.+?)\2/g, (match, p1, p2, p3) => {
        if (p3.startsWith('auth/')) {
            return match; // don't modify /auth
        }
        if (p3.startsWith('api/v1/')) {
            return match; // already modified
        }
        return `${p1}(${p2}/api/v1/${p3}${p2}`;
    });

    if (content !== original) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Updated ${filepath}`);
    }
});