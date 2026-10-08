const fs = require('fs');
const path = require('path');

const updates = {
    'StudentsList.tsx': {
        from: /No students found\./g,
        to: `No students found.<br/><span className="text-sm mt-1 block">Try changing your search or filters, or add a new student.</span>`
    },
    'AdminUsersList.tsx': {
        from: /No users found\./g,
        to: `No users found.<br/><span className="text-sm mt-1 block">No system users have been created yet, or they don't match your search.</span>`
    },
    'CampusesList.tsx': {
        from: /No campuses found\./g,
        to: `No campuses found.<br/><span className="text-sm mt-1 block">Campuses will appear here once they are created.</span>`
    },
    'DepartmentsList.tsx': {
        from: /No departments found\./g,
        to: `No departments found.<br/><span className="text-sm mt-1 block">Departments will appear here once they are created.</span>`
    },
    'InstitutionsList.tsx': {
        from: /No institutions found\./g,
        to: `No institutions found.<br/><span className="text-sm mt-1 block">Institutions will appear here once they are created.</span>`
    },
    'GuardiansList.tsx': {
        from: /No guardians found\./g,
        to: `No guardians found.<br/><span className="text-sm mt-1 block">Guardians will appear here once they are added.</span>`
    },
    'Attendance.tsx': {
        from: /<div className="text-sm text-slate-500 mt-1">No attendance records found<\/div>/g,
        to: `<div className="text-sm text-slate-500 mt-1">No attendance records found. Attendance data will appear after attendance is recorded.</div>`
    },
    'Admissions.tsx': {
        from: /There are currently no records in this stage\./g,
        to: `No admission applications found. Applications will appear here once they are submitted.`
    },
    'Academics.tsx': {
        from: /There are currently no records in this section\./g,
        to: `No academic records found in this section. Create your first record to get started.`
    }
};

const dir = './src/pages';
fs.readdirSync(dir).forEach(file => {
    if (!updates[file]) return;
    let filepath = path.join(dir, file);
    let content = fs.readFileSync(filepath, 'utf8');
    
    // Also, handle empty states that might just be basic text
    content = content.replace(updates[file].from, updates[file].to);

    fs.writeFileSync(filepath, content, 'utf8');
    console.log(`Updated empty states in ${file}`);
});