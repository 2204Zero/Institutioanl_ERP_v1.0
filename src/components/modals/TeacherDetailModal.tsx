import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Mail, BookOpen, Briefcase, Award } from 'lucide-react';
import { useERP } from '../../hooks/useERP';

export const TeacherDetailModal: React.FC = () => {
  const { activeModal, closeModal, selectedTeacher, addToast } = useERP();

  const isOpen = activeModal === 'teacherDetail' && !!selectedTeacher;
  const teacher = selectedTeacher;

  if (!teacher) return null;

  return (
    <Modal isOpen={isOpen} onClose={closeModal} maxWidth="md">
      <div className="text-left space-y-6">
        <div className="flex items-start gap-4 pb-4 border-b border-slate-100">
          <div className="w-14 h-14 rounded-2xl bg-purple-600 text-white font-extrabold text-xl flex items-center justify-center border-2 border-purple-100 shadow-md">
            {teacher.name[0]}
          </div>

          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-900">{teacher.name}</h3>
              <Badge variant="info">{teacher.salaryGrade}</Badge>
            </div>

            <p className="text-xs text-slate-500 font-mono mt-0.5">{teacher.employeeId}</p>

            <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-slate-600">
              <span className="flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5 text-slate-400" /> {teacher.designation}
              </span>
              <span className="flex items-center gap-1">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" /> {teacher.department}
              </span>
            </div>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200/60 text-xs flex items-center gap-2 text-slate-700">
          <Mail className="w-4 h-4 text-slate-400" />
          <span>{teacher.email}</span>
        </div>

        <div>
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Assigned Courses & Subjects
          </h4>
          <div className="flex flex-wrap gap-2">
            {teacher.subjects.map((sub, idx) => (
              <span
                key={idx}
                className="bg-brand-50 text-brand-700 border border-brand-200 text-xs font-semibold px-2.5 py-1 rounded-lg"
              >
                {sub}
              </span>
            ))}
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
          <Button variant="ghost" onClick={closeModal}>
            Close
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={<Award className="w-4 h-4" />}
            onClick={() => {
              closeModal();
              addToast('Faculty Ledger', `Opened teaching logs for ${teacher.name}`, 'info');
            }}
          >
            View Full Faculty Dossier
          </Button>
        </div>
      </div>
    </Modal>
  );
};
