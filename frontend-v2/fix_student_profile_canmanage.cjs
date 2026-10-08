const fs = require('fs');
let file = './src/pages/StudentProfile.tsx';
let content = fs.readFileSync(file, 'utf8');

const editTarget = `<Button variant="outline" className="border-slate-200" onClick={() => toast.info('Edit modal coming soon!')}>
            <Edit className="w-4 h-4 mr-2" /> Edit Profile
          </Button>`;

const editReplace = `{canManage && (
          <Button variant="outline" className="border-slate-200" onClick={() => toast.info('Edit modal coming soon!')}>
            <Edit className="w-4 h-4 mr-2" /> Edit Profile
          </Button>
          )}`;
content = content.replace(editTarget, editReplace);


const dropdownTarget = `<DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="border-slate-200">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => {
                if(window.confirm('Are you sure you want to delete this student?')) {
                  deleteMutation.mutate();
                }
              }}>
                <Trash className="w-4 h-4 mr-2" /> Delete Student
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>`;

const dropdownReplace = `{canManage && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon" className="border-slate-200">
                <MoreVertical className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem className="text-destructive focus:text-destructive cursor-pointer" onClick={() => {
                if(window.confirm('Are you sure you want to delete this student?')) {
                  deleteMutation.mutate();
                }
              }}>
                <Trash className="w-4 h-4 mr-2" /> Delete Student
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          )}`;
content = content.replace(dropdownTarget, dropdownReplace);

// Remove the unused statusMutation if it exists.
// Actually, since I reverted, let me check if `statusMutation` is in the original file. Yes, it was in the error logs!
// But wait! Is it used anywhere in the file? If it's used, why did it say "is declared but its value is never read"?
// Oh! It was NEVER READ because they hadn't implemented the UI to change status yet!
// So I will just add `// @ts-ignore` before it or completely remove it.
const statusMutationTarget = `  const statusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const res = await apiClient.patch(\`/students/\${id}/status\`, { status: newStatus, remarks: 'Updated via portal' });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', id] });
      queryClient.invalidateQueries({ queryKey: ['students'] });
      toast.success('Student status updated!');
    },
    onError: () => {
      toast.error('Failed to update status');
    }
  });`;

content = content.replace(statusMutationTarget, "");

fs.writeFileSync(file, content, 'utf8');