import React, { useState, useEffect } from 'react';
import { Search, GraduationCap, Users, DollarSign, ArrowRight, CornerDownLeft, Sparkles } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { useERP } from '../../hooks/useERP';
import { Badge } from '../ui/Badge';

export const GlobalSearchModal: React.FC = () => {
  const {
    isGlobalSearchOpen,
    setGlobalSearchOpen,
    modules,
    students,
    setActivePath,
    openStudentDetailModal,
    addToast,
  } = useERP();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isGlobalSearchOpen) {
      setQuery('');
    }
  }, [isGlobalSearchOpen]);

  const filteredModules = modules.filter(
    (m) =>
      m.name.toLowerCase().includes(query.toLowerCase()) ||
      m.description.toLowerCase().includes(query.toLowerCase()) ||
      m.category.toLowerCase().includes(query.toLowerCase())
  );

  const filteredStudents = students.filter(
    (s) =>
      s.name.toLowerCase().includes(query.toLowerCase()) ||
      s.rollNo.toLowerCase().includes(query.toLowerCase()) ||
      s.department.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelectModule = (path: string, name: string) => {
    setActivePath(path);
    setGlobalSearchOpen(false);
    addToast('Navigated', `Navigated to ${name} module.`, 'info');
  };

  const handleSelectStudent = (student: (typeof students)[0]) => {
    setGlobalSearchOpen(false);
    openStudentDetailModal(student);
  };

  return (
    <Modal
      isOpen={isGlobalSearchOpen}
      onClose={() => setGlobalSearchOpen(false)}
      title=""
      maxWidth="lg"
      className="p-0 overflow-hidden"
    >
      {/* Search Input Bar */}
      <div className="relative p-4 border-b border-slate-200 bg-slate-50 flex items-center gap-3">
        <Search className="w-5 h-5 text-brand-600 shrink-0" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search 250+ modules, student roll numbers, faculty or ledgers... (e.g. 'Finance', 'Rahul', 'CS-2024')"
          className="w-full bg-transparent text-sm text-slate-900 font-medium focus:outline-none placeholder:text-slate-400"
          autoFocus
        />
        {query && (
          <button
            onClick={() => setQuery('')}
            className="text-xs text-slate-400 hover:text-slate-600 bg-slate-200/80 px-2 py-0.5 rounded font-mono"
          >
            ESC
          </button>
        )}
      </div>

      {/* Results Container */}
      <div className="max-h-96 overflow-y-auto p-4 space-y-6 text-left">
        {/* Modules Match Group */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
            <span>ERP Platform Modules ({filteredModules.length})</span>
            <span className="text-[10px] text-brand-600 font-normal">Press ENTER to select</span>
          </div>

          {filteredModules.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No matching modules found.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {filteredModules.map((m) => (
                <button
                  key={m.id}
                  onClick={() => handleSelectModule(m.path, m.name)}
                  className="flex items-start gap-3 p-3 rounded-lg border border-slate-200/80 hover:border-brand-300 hover:bg-brand-50/50 transition-all text-left group"
                >
                  <div className="p-2 rounded-lg bg-slate-100 group-hover:bg-brand-600 group-hover:text-white transition-colors text-slate-600 mt-0.5">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 truncate">{m.name}</span>
                      <Badge variant="neutral" className="text-[9px]">
                        {m.category}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">{m.description}</p>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Student Records Match Group */}
        <div>
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            <span>Student Information Directory ({filteredStudents.length})</span>
          </div>

          {filteredStudents.length === 0 ? (
            <p className="text-xs text-slate-400 py-2">No matching student records found.</p>
          ) : (
            <div className="space-y-1.5">
              {filteredStudents.map((st) => (
                <button
                  key={st.id}
                  onClick={() => handleSelectStudent(st)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg border border-slate-100 bg-slate-50/60 hover:bg-white hover:border-brand-300 hover:shadow-xs transition-all text-left group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                      {st.name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">{st.name}</span>
                        <span className="text-[10px] font-mono text-slate-500 font-semibold bg-slate-200/60 px-1.5 py-0.5 rounded">
                          {st.rollNo}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {st.department} • {st.semester}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono font-bold text-slate-700">
                      Paid: ₹{st.totalPaid.toLocaleString('en-IN')}
                    </span>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modal Footer Hotkeys */}
      <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-500 font-medium">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <kbd className="bg-white border border-slate-300 rounded px-1 text-[10px] font-mono">↑↓</kbd> Navigate
          </span>
          <span className="flex items-center gap-1">
            <kbd className="bg-white border border-slate-300 rounded px-1 text-[10px] font-mono">↵</kbd> Select
          </span>
        </div>
        <span className="flex items-center gap-1 text-slate-400">
          <Sparkles className="w-3.5 h-3.5 text-brand-600" /> EdERP AI Search Engine
        </span>
      </div>
    </Modal>
  );
};
