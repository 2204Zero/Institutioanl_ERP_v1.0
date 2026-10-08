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
            
            // Add type FormValues
            if (!content.includes('type FormValues = z.infer')) {
                content = content.replace(
                    /export function/g, 
                    `type FormValues = z.infer<typeof ${schemaName}>;\n\nexport function`
                );
            }

            // Replace useForm<...>({ with useForm<FormValues>({
            content = content.replace(/useForm(?:<.*?>)?\(\{/g, `useForm<FormValues>({`);

            // Replace onSubmit = (data: ...) => with FormValues
            content = content.replace(/onSubmit = \(data: (.*?)\) =>/g, `onSubmit = (data: FormValues) =>`);

            // Cast defaultValues
            content = content.replace(/defaultValues: \{([\s\S]*?)\},/g, (match, p1) => {
                if (match.includes('as FormValues')) return match;
                return `defaultValues: {${p1}} as FormValues,`;
            });
            
            // Remove as any from zodResolver if it exists
            content = content.replace(/zodResolver\([^)]+\) as any/g, `zodResolver(${schemaName})`);
        }

        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Processed ${file}`);
    });
}
fixDialogs();