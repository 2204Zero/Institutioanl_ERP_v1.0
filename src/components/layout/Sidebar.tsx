import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  UserCheck,
  Users,
  Calendar,
  CheckCircle,
  Award,
  Briefcase,
  BookOpen,
  Home,
  Bus,
  Shield,
  Building,
  ChevronDown,
  ChevronRight,
  Star,
  Clock,
  Search,
  PanelLeftClose,
  PanelLeftOpen,
  GraduationCap,
} from 'lucide-react';
import { useERP } from '../../hooks/useERP';
import { ERPDomain } from '../../types/erp';

export const Sidebar: React.FC = () => {
  const {
    isSidebarCollapsed,
    toggleSidebar,
    modules,
    activePath,
    setActivePath,
    toggleFavoriteModule,
    recentPages,
  } = useERP();

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategory, setExpandedCategory] = useState<Record<ERPDomain, boolean>>({
    Foundation: true,
    Academic: true,
    Enterprise: true,
  });

  const iconMap: Record<string, React.ReactNode> = {
    DollarSign: <DollarSign className="w-4 h-4 shrink-0" />,
    UserCheck: <UserCheck className="w-4 h-4 shrink-0" />,
    Users: <Users className="w-4 h-4 shrink-0" />,
    Calendar: <Calendar className="w-4 h-4 shrink-0" />,
    CheckCircle: <CheckCircle className="w-4 h-4 shrink-0" />,
    Award: <Award className="w-4 h-4 shrink-0" />,
    Briefcase: <Briefcase className="w-4 h-4 shrink-0" />,
    BookOpen: <BookOpen className="w-4 h-4 shrink-0" />,
    Home: <Home className="w-4 h-4 shrink-0" />,
    Bus: <Bus className="w-4 h-4 shrink-0" />,
    Shield: <Shield className="w-4 h-4 shrink-0" />,
    Building: <Building className="w-4 h-4 shrink-0" />,
  };

  const toggleCategory = (cat: ERPDomain) => {
    setExpandedCategory((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filteredModules = modules.filter(
    (m) =>
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favoriteModules = modules.filter((m) => m.isFavorite);

  const categories: ERPDomain[] = ['Foundation', 'Academic', 'Enterprise'];

  return (
    <motion.aside
      animate={{ width: isSidebarCollapsed ? 80 : 260 }}
      transition={{ type: 'spring', stiffness: 300, damping: 28 }}
      className="h-screen sticky top-0 bg-slate-900 text-slate-300 border-r border-slate-800 flex flex-col z-30 select-none overflow-hidden shrink-0"
    >
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-brand-600 to-brand-400 flex items-center justify-center text-white font-bold shadow-lg shadow-brand-500/30 shrink-0">
            <GraduationCap className="w-6 h-6" />
          </div>
          {!isSidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col leading-tight whitespace-nowrap"
            >
              <span className="font-extrabold text-white text-base tracking-tight">EdERP Suite</span>
              <span className="text-[10px] text-brand-400 font-semibold uppercase tracking-wider">Enterprise v2.4</span>
            </motion.div>
          )}
        </div>

        <button
          onClick={toggleSidebar}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          title={isSidebarCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isSidebarCollapsed ? <PanelLeftOpen className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar Quick Module Search */}
      {!isSidebarCollapsed && (
        <div className="px-3 pt-3 pb-1">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search 250+ modules..."
              className="w-full bg-slate-800/70 text-slate-200 text-xs rounded-lg pl-8 pr-3 py-1.5 border border-slate-700/60 focus:outline-none focus:border-brand-500 placeholder:text-slate-500"
            />
          </div>
        </div>
      )}

      {/* Main Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {/* Favorites Section */}
        {!isSidebarCollapsed && favoriteModules.length > 0 && (
          <div>
            <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> Favorites
            </div>
            <div className="space-y-0.5 mt-1">
              {favoriteModules.map((m) => {
                const isActive = activePath === m.path;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActivePath(m.path)}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-brand-600 text-white shadow-sm'
                        : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {iconMap[m.iconName]}
                      <span className="truncate">{m.name}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Domain Categorized Menus */}
        {categories.map((category) => {
          const categoryModules = filteredModules.filter((m) => m.category === category);
          if (categoryModules.length === 0) return null;
          const isExpanded = expandedCategory[category];

          return (
            <div key={category}>
              {!isSidebarCollapsed ? (
                <button
                  onClick={() => toggleCategory(category)}
                  className="w-full px-2 py-1 flex items-center justify-between text-[11px] font-bold text-slate-400 uppercase tracking-wider hover:text-slate-200"
                >
                  <span>{category} Domain</span>
                  {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
              ) : (
                <div className="h-px bg-slate-800 my-2" />
              )}

              <AnimatePresence initial={false}>
                {(isExpanded || isSidebarCollapsed) && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="space-y-0.5 mt-1"
                  >
                    {categoryModules.map((m) => {
                      const isActive = activePath === m.path;

                      return (
                        <div key={m.id} className="group relative flex items-center">
                          <button
                            onClick={() => setActivePath(m.path)}
                            className={`w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-xs font-medium transition-all ${
                              isActive
                                ? 'bg-brand-600 text-white font-semibold shadow-md shadow-brand-600/30'
                                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                            }`}
                            title={isSidebarCollapsed ? m.name : undefined}
                          >
                            <span className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}>
                              {iconMap[m.iconName]}
                            </span>
                            {!isSidebarCollapsed && <span className="truncate flex-1 text-left">{m.name}</span>}
                          </button>

                          {!isSidebarCollapsed && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleFavoriteModule(m.id);
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-amber-400 transition-opacity absolute right-2"
                              title={m.isFavorite ? 'Remove Favorite' : 'Pin Favorite'}
                            >
                              <Star className={`w-3.5 h-3.5 ${m.isFavorite ? 'text-amber-400 fill-amber-400' : ''}`} />
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}

        {/* Recently Visited */}
        {!isSidebarCollapsed && recentPages.length > 0 && (
          <div className="pt-2 border-t border-slate-800/80">
            <div className="px-2 py-1 text-[10px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Clock className="w-3 h-3 text-slate-400" /> Recent Pages
            </div>
            <div className="space-y-0.5 mt-1">
              {recentPages.map((path) => {
                const moduleObj = modules.find((m) => m.path === path);
                if (!moduleObj) return null;
                return (
                  <button
                    key={path}
                    onClick={() => setActivePath(path)}
                    className="w-full text-left px-2.5 py-1 text-[11px] text-slate-400 hover:text-white hover:bg-slate-800/60 rounded truncate"
                  >
                    {moduleObj.name}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Footer User Info */}
      <div className="p-3 border-t border-slate-800 bg-slate-950/50 flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center font-bold text-xs text-white shrink-0">
          RK
        </div>
        {!isSidebarCollapsed && (
          <div className="flex flex-col truncate leading-tight">
            <span className="text-xs font-semibold text-white truncate">Dr. Rajesh Kumar</span>
            <span className="text-[10px] text-slate-400 truncate">Dean of Academic Affairs</span>
          </div>
        )}
      </div>
    </motion.aside>
  );
};
