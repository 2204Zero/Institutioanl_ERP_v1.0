const fs = require('fs');
const path = require('path');

function fixDialogs() {
    const dir = './src/components';
    fs.readdirSync(dir).forEach(file => {
        if (!file.endsWith('Dialog.tsx')) return;
        let filepath = path.join(dir, file);
        let content = fs.readFileSync(filepath, 'utf8');

        // Replace useForm<FormValues> with useForm<FormValues, any, FormValues>
        content = content.replace(/useForm<FormValues>\(\{/g, `useForm<FormValues, any, FormValues>({`);

        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Forced FormValues generic on ${file}`);
    });
}
fixDialogs();