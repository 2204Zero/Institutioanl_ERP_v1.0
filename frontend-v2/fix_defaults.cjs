const fs = require('fs');
const path = require('path');

function fixDefaultValues() {
    const dir = './src/components';
    fs.readdirSync(dir).forEach(file => {
        if (!file.endsWith('Dialog.tsx')) return;
        let filepath = path.join(dir, file);
        let content = fs.readFileSync(filepath, 'utf8');

        // Fix studentId: 0 -> studentId: ''
        content = content.replace(/studentId:\s*0/g, "studentId: ''");
        
        // Fix amount: 0 -> amount: ''
        content = content.replace(/amount:\s*0/g, "amount: ''");

        // Fix other common numeric defaultValues that clash with z.string()
        content = content.replace(/guardianId:\s*0/g, "guardianId: ''");
        content = content.replace(/institutionId:\s*0/g, "institutionId: ''");
        content = content.replace(/departmentId:\s*0/g, "departmentId: ''");

        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Fixed defaults in ${file}`);
    });
}
fixDefaultValues();