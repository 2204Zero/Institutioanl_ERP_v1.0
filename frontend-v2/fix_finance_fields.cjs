const fs = require('fs');
let file = './src/pages/FinanceDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/\{fee\.feeStructure\?.feeName \|\| 'General Fee'\}/g, "Structure ID: {fee.feeStructureId}");
content = content.replace(/\{fee\.academicYear\?.year \|\| '-'\}/g, "{fee.academicYearId}");
content = content.replace(/fee\.amountDue\?/g, "fee.netPayable?");
content = content.replace(/fee\.amountPaid/g, "fee.paidAmount");
content = content.replace(/fee\.dueDate \? new Date\(fee\.dueDate\)\.toLocaleDateString\(\) : '-'/g, "'-'");

fs.writeFileSync(file, content, 'utf8');