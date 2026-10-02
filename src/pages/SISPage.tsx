import React, { useState } from 'react';
import { Users, UserPlus, Search, Filter, GraduationCap, Mail, Phone, Building } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../components/ui/Table';
import { Badge } from '../components/ui/Badge';
import { useERP } from '../hooks/useERP';

export const SISPage: React.FC = () => {
  const { students, openStudentDetailModal } = useERP();
  const [searchTerm, setSearchTerm] = useState('');

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <GraduationCap className="w-7 h-7 text-blue-600" />
            Student Information System (SIS)
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage student enrollments, academic profiles, guardians, and status history.
          </p>
        </div>

        <Button variant="primary">
          <UserPlus className="w-4 h-4 mr-2" />
          Enroll New Student
        </Button>
      </div>

      {/* Filter & Controls */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="flex-1 w-full">
            <Input
              type="text"
              placeholder="Search by student name, roll number, or department..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              leftIcon={<Search className="w-4 h-4 text-slate-400" />}
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter Department
          </Button>
        </div>
      </Card>

      {/* Data Table */}
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Student Name</TableHead>
            <TableHead>Roll Number</TableHead>
            <TableHead>Department</TableHead>
            <TableHead>Semester</TableHead>
            <TableHead>CGPA</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredStudents.map((student) => (
            <TableRow key={student.id}>
              <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                {student.name}
              </TableCell>
              <TableCell className="font-mono text-xs text-slate-600 dark:text-slate-400">
                {student.rollNo}
              </TableCell>
              <TableCell>{student.department}</TableCell>
              <TableCell>{student.semester}</TableCell>
              <TableCell className="font-semibold">{student.cgpa}</TableCell>
              <TableCell>
                <Badge variant={student.status === 'Active' ? 'success' : 'warning'}>
                  {student.status}
                </Badge>
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openStudentDetailModal(student)}
                >
                  View Profile
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
