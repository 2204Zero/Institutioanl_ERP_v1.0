const fs = require('fs');
let file = './src/pages/FinanceDashboard.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('useMyStudentId')) {
    content = content.replace(/import \{ useQuery \} from '@tanstack\/react-query';/, "import { useQuery } from '@tanstack/react-query';\nimport { useAuthStore } from '../store/useAuthStore';\nimport { useMyStudentId } from '../hooks/useMyStudentId';");
}

const componentStart = `export default function FinanceDashboard() {
  const { user } = useAuthStore();
  const { data: myStudentId, isLoading: isLoadingId } = useMyStudentId();
  const isPersonalView = user?.role === 'STUDENT' || user?.role === 'PARENT';

  const { data: fees, isLoading, isError } = useQuery<StudentFee[]>({
    queryKey: ['student-fees', isPersonalView, myStudentId],
    queryFn: async () => {
      if (isPersonalView) {
        if (!myStudentId) return [];
        const res = await apiClient.get(\`/api/v1/finance/student-fees/student/\${myStudentId}\`);
        return res.data || [];
      }
      const res = await apiClient.get('/api/v1/finance/student-fees');
      return res.data || [];
    },
    enabled: isPersonalView ? !!myStudentId : true
  });`;

content = content.replace(/export default function FinanceDashboard\(\) \{[\s\S]*?\}\);/, componentStart);

const viewLogic = `  if (isLoading || (isPersonalView && isLoadingId)) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
      </div>
    );
  }

  if (isPersonalView) {
    return (
      <div className="p-4 md:p-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900 mb-1">{user?.role === 'PARENT' ? 'Ward Fees' : 'My Fees'}</h1>
            <p className="text-slate-500 text-sm">View your fee records and payment status.</p>
          </div>
        </div>

        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-x-auto mt-6">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold px-6 py-4">Fee Details</TableHead>
                <TableHead className="font-semibold px-6 py-4">Amount</TableHead>
                <TableHead className="font-semibold px-6 py-4">Status</TableHead>
                <TableHead className="font-semibold px-6 py-4">Due Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isError ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-destructive">Failed to load fees.</TableCell>
                </TableRow>
              ) : !fees || fees.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-slate-500">No fee records found.<br/><span className="text-sm mt-1 block">Fee records will appear here once they are created.</span></TableCell>
                </TableRow>
              ) : (
                fees.map((fee) => (
                  <TableRow key={fee.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{fee.feeStructure?.feeName || 'General Fee'}</div>
                      <div className="text-sm text-slate-500">Academic Year: {fee.academicYear?.year || '-'}</div>
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <div className="font-bold text-slate-900">$\${fee.amountDue?.toFixed(2) || '0.00'}</div>
                      {fee.amountPaid > 0 && <div className="text-xs text-green-600 font-medium mt-1">Paid: $\${fee.amountPaid.toFixed(2)}</div>}
                    </TableCell>
                    <TableCell className="px-6 py-4">
                      <span className={\`px-3 py-1 rounded-full text-xs font-semibold \${
                        fee.status === 'PAID' ? 'bg-green-100 text-green-700' :
                        fee.status === 'PARTIAL' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'
                      }\`}>
                        {fee.status || 'PENDING'}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-slate-600">{fee.dueDate ? new Date(fee.dueDate).toLocaleDateString() : '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }`;

content = content.replace(/  if \(isLoading\) \{[\s\S]*?\}\)/, viewLogic);

fs.writeFileSync(file, content, 'utf8');