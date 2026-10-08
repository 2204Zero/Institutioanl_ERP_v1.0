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
    if (!filepath.endsWith('.tsx')) return;
    
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Quick regex to add aria-label to MoreHorizontal buttons
    content = content.replace(/<Button variant="ghost" size="icon" className="([^"]*)">\s*<MoreHorizontal/g, 
    '<Button variant="ghost" size="icon" aria-label="More options" className="$1">\n                        <MoreHorizontal');

    // Also add aria-labels to next/prev pagination buttons
    content = content.replace(/<Button\s+variant="outline"\s+className="text-slate-600 border-slate-200"\s+onClick=\{\(\) => setPage\(Math.max\(0, page - 1\)\)\}\s+disabled=\{page === 0\}\s*>/g,
    `<Button \n               variant="outline" \n               aria-label="Previous page"\n               className="text-slate-600 border-slate-200" \n               onClick={() => setPage(Math.max(0, page - 1))}\n               disabled={page === 0}\n             >`);

    content = content.replace(/<Button\s+variant="outline"\s+className="text-slate-600 border-slate-200"\s+onClick=\{\(\) => setPage\(page \+ 1\)\}\s+disabled=\{!students\?.last\}\s*>/g,
    `<Button \n               variant="outline" \n               aria-label="Next page"\n               className="text-slate-600 border-slate-200" \n               onClick={() => setPage(page + 1)}\n               disabled={!students?.last}\n             >`);

    fs.writeFileSync(filepath, content, 'utf8');
});