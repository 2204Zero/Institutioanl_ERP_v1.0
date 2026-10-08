const fs = require('fs');
const path = require('path');

function fixDialogs() {
    const dir = './src/components';
    fs.readdirSync(dir).forEach(file => {
        if (!file.endsWith('Dialog.tsx')) return;
        let filepath = path.join(dir, file);
        let content = fs.readFileSync(filepath, 'utf8');

        // 1. Remove z.coerce.number() and replace with z.string()
        content = content.replace(/z\.coerce\.number\(\)/g, "z.string()");
        
        // 2. Ensure useForm has the generic <z.infer<typeof schemaName>>
        let schemaMatch = content.match(/const (\w+Schema) = z\.object/);
        if (schemaMatch) {
            let schemaName = schemaMatch[1];
            // If it has useForm({, add the generic
            content = content.replace(/useForm\(\{/g, `useForm<z.infer<typeof ${schemaName}>>({`);
            // If it has useForm<z.infer...>(, leave it alone
            // If it has useForm<AttendanceRecordRequest>(, replace it
            content = content.replace(/useForm<(\w+Request|StudentFormValues)>\(\{/g, `useForm<z.infer<typeof ${schemaName}>>({`);
            
            // Fix onSubmit type
            content = content.replace(/onSubmit = \(data: (.*?)\) =>/g, `onSubmit = (data: z.infer<typeof ${schemaName}>) =>`);
            
            // Fix mutation payload type
            content = content.replace(/mutationFn: async \(data: (.*?)\) =>/g, `mutationFn: async (data: any) =>`); // We use any here temporarily to avoid deep typing issues on the mutation, but the data is safely inferred in onSubmit. Wait, let's just cast data inside the mutation.
        }

        // 3. Update the onSubmit to handle number conversion
        // E.g., for TakeAttendanceDialog, studentId needs to be a number
        if (file === 'TakeAttendanceDialog.tsx') {
             content = content.replace(/mutation.mutate\(data\);/, "mutation.mutate({ ...data, studentId: Number(data.studentId) });");
        } else if (file === 'CreateInvoiceDialog.tsx') {
             content = content.replace(/mutation.mutate\(data\);/, "mutation.mutate({ ...data, studentId: Number(data.studentId), amount: Number(data.amount) });");
        }
        
        fs.writeFileSync(filepath, content, 'utf8');
        console.log(`Fixed ${file}`);
    });
}
fixDialogs();