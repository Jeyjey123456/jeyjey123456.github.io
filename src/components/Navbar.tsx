import React, { useState } from 'react';
import { Search, FileUp, ShieldAlert, ArrowRight } from 'lucide-react';

interface NavbarProps {
  activeView: 'dashboard' | 'take-exam' | 'create-exam' | 'forbidden';
  isAdmin: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onNavigateDashboard: () => void;
  onNavigateCreate: () => void;
  onOpenExamByLinkOrCode: (rawLinkOrId: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeView,
  isAdmin,
  searchQuery,
  onSearchChange,
  onNavigateDashboard,
  onNavigateCreate,
  onOpenExamByLinkOrCode,
}) => {
  const [directLinkInput, setDirectLinkInput] = useState('');

  const handleLinkSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!directLinkInput.trim()) return;
    onOpenExamByLinkOrCode(directLinkInput.trim());
    setDirectLinkInput('');
  };

  return (
    <header className="bg-[#1e2638] text-white sticky top-0 z-40 shadow-sm">
      <div className="max-w-[1380px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Brand Title */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={onNavigateDashboard}
            className="text-lg font-extrabold tracking-tight whitespace-nowrap shrink-0 cursor-pointer focus:outline-none"
          >
            <span className="text-white">BaiTap</span>
            <span className="text-[#22c55e]">TracNghiem</span>
          </button>

          {isAdmin && (
            <span className="hidden md:inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>Quyền Admin (Console)</span>
            </span>
          )}
        </div>

        {/* Zone 2: Quick Exam Link / Code Access */}
        <form
          onSubmit={handleLinkSubmit}
          className="hidden md:flex items-center gap-1.5 w-72 lg:w-80"
        >
          <input
            type="text"
            aria-label="Vào link hoặc mã đề thi"
            value={directLinkInput}
            onChange={(e) => setDirectLinkInput(e.target.value)}
            placeholder="Nhập mã đề hoặc link đề (/lam-bai/...)"
            className="w-full bg-slate-800/90 border border-slate-600/80 text-slate-100 placeholder-slate-400 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
          />
          <button
            type="submit"
            className="px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-xs font-semibold text-white transition-colors shrink-0 cursor-pointer flex items-center gap-1"
            title="Mở đề theo link/mã"
          >
            <span>Vào đề</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </form>

        {/* Zone 3: Search Input & Admin Create Action (No user account widget) */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="relative w-48 sm:w-64">
            <input
              type="search"
              aria-label="Tìm kiếm đề thi"
              value={searchQuery}
              onChange={(e) => {
                onSearchChange(e.target.value);
                if (activeView !== 'dashboard') {
                  onNavigateDashboard();
                }
              }}
              placeholder="Tìm kiếm đề thi..."
              className="w-full bg-white text-slate-800 placeholder-slate-400 text-sm rounded-lg pl-3.5 pr-9 py-1.5 focus:outline-none focus:ring-2 focus:ring-[#22c55e]"
            />
            <Search className="w-4 h-4 text-slate-500 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {isAdmin && (
            <button
              type="button"
              onClick={onNavigateCreate}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'create-exam'
                  ? 'bg-[#22c55e] text-white'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              <FileUp className="w-3.5 h-3.5" />
              <span>Tạo Đề / Số hoá .docx</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
