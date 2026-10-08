const fs = require('fs');
let file = './src/pages/Attendance.tsx';
let content = fs.readFileSync(file, 'utf8');

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
            <h1 className="text-3xl font-bold text-slate-900 mb-1">{user?.role === 'PARENT' ? 'Ward Attendance' : 'My Attendance'}</h1>
            <p className="text-slate-500 text-sm">View your recent attendance records.</p>
          </div>
        </div>
        <div className="bg-white border border-slate-100 rounded-3xl shadow-sm overflow-x-auto mt-6">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="font-semibold px-6 py-4">Date</TableHead>
                <TableHead className="font-semibold px-6 py-4">Course/Subject</TableHead>
                <TableHead className="font-semibold px-6 py-4">Status</TableHead>
                <TableHead className="font-semibold px-6 py-4">Marked By</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isError ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-destructive">Failed to load attendance.</TableCell>
                </TableRow>
              ) : !records || records.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-24 text-center text-slate-500">No attendance records found. Attendance data will appear after attendance is recorded.</TableCell>
                </TableRow>
              ) : (
                records.map((record) => (
                  <TableRow key={record.id} className="hover:bg-slate-50/80 transition-colors">
                    <TableCell className="px-6 py-4 text-slate-600">{new Date(record.date).toLocaleDateString()}</TableCell>
                    <TableCell className="px-6 py-4 text-slate-600">{record.courseCode || 'General'}</TableCell>
                    <TableCell className="px-6 py-4">
                      <span className={\`px-3 py-1 rounded-full text-xs font-semibold \${
                        record.status === 'PRESENT' ? 'bg-green-100 text-green-700' :
                        record.status === 'ABSENT' ? 'bg-red-100 text-red-700' :
                        'bg-orange-100 text-orange-700'
                      }\`}>
                        {record.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-6 py-4 text-slate-600">{record.markedBy || '-'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  return (`;

content = content.replace(/  return \(/, viewLogic);
fs.writeFileSync(file, content, 'utf8');