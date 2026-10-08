const fs = require('fs');
let file = './src/pages/StudentProfile.tsx';
let content = fs.readFileSync(file, 'utf8');

// Completely remove the commented statusMutation object
content = content.replace(/\/\/ const statusMutation = useMutation\(\{[\s\S]*?\}\);/, "");
// If it was already uncommented somehow
content = content.replace(/const statusMutation = useMutation\(\{[\s\S]*?\}\);/, "");
// And also handle the one with just hanging properties
content = content.replace(/  \/\/ const statusMutation = useMutation\(\{\r?\n    mutationFn: async \(newStatus: string\) => \{\r?\n      const res = await apiClient\.patch\(`\/students\/\$\{id\}\/status`, \{ status: newStatus, remarks: 'Updated via portal' \}\);\r?\n      return res\.data;\r?\n    \},\r?\n    onSuccess: \(\) => \{\r?\n      queryClient\.invalidateQueries\(\{ queryKey: \['student', id\] \}\);\r?\n      queryClient\.invalidateQueries\(\{ queryKey: \['students'\] \}\);\r?\n      toast\.success\('Student status updated!'\);\r?\n    \},\r?\n    onError: \(\) => \{\r?\n      toast\.error\('Failed to update status'\);\r?\n    \}\r?\n  \}\);\r?\n/, "");


content = content.replace(/DropdownMenuLabel,/g, "");
content = content.replace(/DropdownMenuSeparator,/g, "");

fs.writeFileSync(file, content, 'utf8');