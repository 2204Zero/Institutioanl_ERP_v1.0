const fs = require('fs');
let file = './src/components/Layout.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/<div className="min-h-screen flex bg-\[#f4f4f5\] font-sans flex-col md:flex-row">/, 
`<div className="min-h-screen flex bg-[#f4f4f5] font-sans flex-col md:flex-row">
      {!isOnline && (
        <div className="fixed top-0 left-0 w-full bg-red-600 text-white text-center py-2 text-sm z-50 font-medium">
          You are offline. Some features may not work until your connection is restored.
        </div>
      )}`
);
fs.writeFileSync(file, content, 'utf8');