import * as fs from 'fs';
import * as path from 'path';

function walk(dir: string, callback: (filepath: string) => void) {
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

    // We look for apiClient.METHOD('/path') or apiClient.METHOD(\/path\)
    // and replace it with apiClient.METHOD('/api/v1/path')
    // UNLESS it's /auth
    
    content = content.replace(/(apiClient\.(?:get|post|put|patch|delete))\((['"])\/(.+?)\2/g, (match, p1, p2, p3) => {
        if (p3.startsWith('auth/')) {
            return match; // don't modify /auth
        }
        if (p3.startsWith('api/v1/')) {
            return match; // already modified
        }
        return \\(\/api/v1/\\\;
    });

    if (content !== original) {
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(\Updated \\);
    }
});