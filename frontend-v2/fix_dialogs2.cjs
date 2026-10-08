const fs = require('fs');
const path = require('path');

function fixDialogs() {
    const dir = './src/components';
    fs.readdirSync(dir).forEach(file => {
        if (!file.endsWith('Dialog.tsx')) return;
        let filepath = path.join(dir, file);
        let content = fs.readFileSync(filepath, 'utf8');

        let schemaMatch = content.match(/const (\w+Schema) = z\.object/);
        if (schemaMatch) {
            let schemaName = schemaMatch[1];
            
            // Revert all useForm generics to useForm<z.infer<typeof schemaName>>
            content = content.replace(/useForm(?:<.*?>)?\(\{/g, `useForm<z.infer<typeof ${schemaName}>>({`);
            
            // Cast defaultValues as z.infer<typeof schemaName> to fix enum/string inference
            content = content.replace(/defaultValues:\s*\{/g, `defaultValues: {`);
        }

        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Processed ${file}`);
    });
}
fixDialogs();