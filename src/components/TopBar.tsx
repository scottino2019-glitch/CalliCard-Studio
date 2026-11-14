import { Download } from 'lucide-react';
import { CardTemplate } from '../types/card';

export type WorkspaceView = 'editor' | 'archive';

interface TopBarProps {
  activeView: WorkspaceView;
  activeTemplate: CardTemplate;
  savedCount: number;
  onSelectTemplate: (template: CardTemplate) => void;
  onSelectArchive: () => void;
  onQuickExport: () => void;
  isExporting: boolean;
}

const TEMPLATE_LINKS: { id: CardTemplate; label: string }[] = [
  { id: 'word', label: 'Scheda Parola' },
  { id: 'minimal', label: 'Minimale' },
  { id: 'dialogue', label: 'Dialogo' },
  { id: 'quiz', label: 'Quiz' },
];

export function TopBar({
  activeView,
  activeTemplate,
  savedCount,
  onSelectTemplate,
  onSelectArchive,
  onQuickExport,
  isExporting,
}: TopBarProps) {
  return (
    <header className="h-15 bg-[#1E2B3C] text-[#F8FAFC] border-b border-[#0F172A] px-4 md:px-6 flex items-center justify-between gap-4 md:gap-8 shrink-0 z-20">
      {/* Zone 1: Single text element wordmark */}
      <a
        href="#top"
        onClick={(e) => {
          e.preventDefault();
          onSelectTemplate(activeTemplate);
        }}
        className="font-display text-lg font-bold tracking-tight text-[#FFFFFF] whitespace-nowrap shrink-0"
      >
        CalliCard Studio
      </a>

      {/* Zone 2: 5 clean single-line navigation links */}
      <nav
        aria-label="Modelli scheda"
        className="hidden md:flex items-center gap-7 text-[15px] font-medium"
      >
        {TEMPLATE_LINKS.map((item) => {
          const isActive = activeView === 'editor' && activeTemplate === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onSelectTemplate(item.id)}
              className={`py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 rounded-xs ${
                isActive
                  ? 'border-[#F0525E] text-[#FFFFFF] font-semibold'
                  : 'border-transparent text-[#CBD5E1] hover:text-[#FFFFFF] hover:border-[#94A3B8]'
              }`}
            >
              {item.label}
            </button>
          );
        })}
        <button
          type="button"
          onClick={onSelectArchive}
          className={`py-1.5 border-b-2 transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300 rounded-xs ${
            activeView === 'archive'
              ? 'border-[#F0525E] text-[#FFFFFF] font-semibold'
              : 'border-transparent text-[#CBD5E1] hover:text-[#FFFFFF] hover:border-[#94A3B8]'
          }`}
        >
          Archivio ({savedCount})
        </button>
      </nav>

      {/* Zone 3: Mobile Archive shortcut + Primary Export CTA */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          type="button"
          onClick={activeView === 'archive' ? () => onSelectTemplate(activeTemplate) : onSelectArchive}
          className={`md:hidden py-1.5 px-2.5 text-sm font-semibold rounded-md border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
            activeView === 'archive'
              ? 'bg-[#32455E] border-[#F0525E] text-white'
              : 'bg-[#28384D] border-[#64748B] text-[#F1F5F9] hover:text-white'
          }`}
        >
          {activeView === 'archive' ? 'Editor' : `Archivio (${savedCount})`}
        </button>
        <button
          type="button"
          onClick={onQuickExport}
          disabled={isExporting}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-[#C43B46] hover:bg-[#D64551] disabled:opacity-60 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-[#1E2B3C] focus-visible:ring-rose-300"
        >
          <Download className="w-4 h-4" aria-hidden="true" />
          <span>{isExporting ? 'Esportazione...' : 'Esporta HD'}</span>
        </button>
      </div>
    </header>
  );
}
