const fs = require('fs');
const path = require('path');

const dir = './src/components';

fs.readdirSync(dir).forEach(file => {
    if (!file.endsWith('.tsx')) return;
    let filepath = path.join(dir, file);
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Find the schema name: const XYZSchema = z.object...
    let schemaMatch = content.match(/const (\w+Schema) = z\.object/);
    if (!schemaMatch) return;
    
    let schemaName = schemaMatch[1];

    // Find the generic interface used in useForm<XYZRequest>
    let useFormMatch = content.match(/useForm<(\w+)>\(\{/);
    if (!useFormMatch) return;

    let interfaceName = useFormMatch[1];
    
    // Don't replace if it's already z.infer or FormValues
    if (interfaceName.includes('infer') || interfaceName.includes('FormValues')) return;

    content = content.replace(new RegExp(`useForm<${interfaceName}>`, 'g'), `useForm<z.infer<typeof ${schemaName}>>`);
    content = content.replace(new RegExp(`\\(data: ${interfaceName}\\)`, 'g'), `(data: z.infer<typeof ${schemaName}>)`);
    
    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated ${file}`);
});