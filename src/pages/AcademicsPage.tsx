import React from 'react';
import { BookOpen, Layers, Award, Plus } from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';

export const AcademicsPage: React.FC = () => {
  const courses = [
    { code: 'CS-301', title: 'Data Structures & Algorithms', credits: 4, department: 'Computer Science' },
    { code: 'CS-302', title: 'Database Management Systems', credits: 4, department: 'Computer Science' },
    { code: 'EC-201', title: 'Analog Communication', credits: 3, department: 'Electronics' },
    { code: 'ME-401', title: 'Thermodynamics & Heat Transfer', credits: 4, department: 'Mechanical' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <BookOpen className="w-7 h-7 text-indigo-600" />
            Academics & Curriculum Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Define degree programs, course catalogs, credit requirements, and section allocations.
          </p>
        </div>

        <Button variant="primary">
          <Plus className="w-4 h-4 mr-2" />
          Add Course
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {courses.map((course) => (
          <Card key={course.code} className="p-6 space-y-3 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <span className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 text-xs font-bold font-mono">
                {course.code}
              </span>
              <span className="text-xs font-medium text-slate-400">{course.credits} Credits</span>
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">{course.title}</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">{course.department}</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
