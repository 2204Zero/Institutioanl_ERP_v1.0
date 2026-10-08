const fs = require('fs');
let file = './src/components/Layout.tsx';
let content = fs.readFileSync(file, 'utf8');

// Find the ADMIN case block
const adminMatch = content.match(/case 'ADMIN':[\s\S]*?(?=case 'FACULTY':)/);
if (adminMatch) {
    let adminBlock = adminMatch[0];
    // Add Attendance and Finance to the OPERATIONS section
    const newOperations = `
              <div className="text-xs font-semibold text-slate-500 mb-3 tracking-wider">OPERATIONS</div>
              <nav className="space-y-1 mb-6">
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/students" className={getLinkClass('/dashboard/students')}><Users className="w-4 h-4" /><span className="text-sm">Students</span></Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/attendance" className={getLinkClass('/dashboard/attendance')}><CalendarCheck className="w-4 h-4" /><span className="text-sm">Attendance</span></Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/finance" className={getLinkClass('/dashboard/finance')}><Wallet className="w-4 h-4" /><span className="text-sm">Finance</span></Link>
                <Link onClick={() => setIsMobileMenuOpen(false)} to="/dashboard/admin/users" className={getLinkClass('/dashboard/admin/users')}><ShieldAlert className="w-4 h-4" /><span className="text-sm">Users</span></Link>
              </nav>
`;
    // Replace the existing OPERATIONS section
    adminBlock = adminBlock.replace(/<div className="text-xs font-semibold text-slate-500 mb-3 tracking-wider">OPERATIONS<\/div>[\s\S]*?<\/nav>/, newOperations.trim());
    
    content = content.replace(adminMatch[0], adminBlock);
    fs.writeFileSync(file, content, 'utf8');
}