import { useEffect, useRef, useState } from 'react';
import { Copy, Download, FolderOpen, Search, Trash2 } from 'lucide-react';
import { ASPECT_RATIOS } from '../data/presets';
import { CardProject, LanguageMode } from '../types/card';
import { ensureProjectFontsLoaded, renderCardToCanvas } from '../utils/canvasRenderer';

interface ArchiveViewProps {
  savedCards: CardProject[];
  onOpenCard: (card: CardProject) => void;
  onDuplicateCard: (card: CardProject) => void;
  onDeleteCard: (id: string) => void;
  onExportCard: (card: CardProject) => void;
  onBackToEditor: () => void;
}

function CardThumbnail({ card }: { card: CardProject }) {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const spec = ASPECT_RATIOS[card.aspectRatio];

  useEffect(() => {
    let cancelled = false;
    const canvas = ref.current;
    if (!canvas) return;
    renderCardToCanvas(canvas, card, 0.35);
    ensureProjectFontsLoaded(card).then(() => {
      if (!cancelled && ref.current) {
        renderCardToCanvas(ref.current, card, 0.35);
      }
    });
    return () => {
      cancelled = true;
    };
  }, [card]);

  return (
    <div className="aspect-[4/3] studio-mat border-b border-[#64748B] flex items-center justify-center p-5 overflow-hidden">
      <canvas
        ref={ref}
        style={{
          aspectRatio: `${spec.width} / ${spec.height}`,
        }}
        className="max-w-full max-h-full object-contain shadow-[0_10px_24px_rgba(15,23,42,0.22)] ring-1 ring-[#64748B]"
      />
    </div>
  );
}

export function ArchiveView({
  savedCards,
  onOpenCard,
  onDuplicateCard,
  onDeleteCard,
  onExportCard,
  onBackToEditor,
}: ArchiveViewProps) {
  const [filterLang, setFilterLang] = useState<'all' | LanguageMode>('all');
  const [query, setQuery] = useState('');

  const filtered = savedCards.filter((card) => {
    if (filterLang !== 'all' && card.language !== filterLang) return false;
    if (query.trim()) {
      const q = query.toLowerCase();
      const hay = `${card.name} ${card.word.word} ${card.minimal.word} ${card.quiz.question}`.toLowerCase();
      return hay.includes(q);
    }
    return true;
  });

  return (
    <main className="flex-1 overflow-y-auto bg-[#CFD9E6] p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="font-display text-2xl font-bold text-[#0B1320]">
              Archivio Locale delle Schede
            </h1>
            <p className="text-[15px] font-medium text-[#273549] mt-1">
              Tutte le schede salvate restano esclusivamente nel tuo browser senza alcun server esterno.
            </p>
          </div>

          <button
            type="button"
            onClick={onBackToEditor}
            className="px-4 py-2.5 text-sm font-bold text-[#FFFFFF] bg-[#1E2B3C] hover:bg-[#2A3B52] rounded-lg shadow-xs transition-colors cursor-pointer whitespace-nowrap"
          >
            Torna all’Editor
          </button>
        </div>

        {/* Search & Language Filter Toolbar */}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#E3EAF4] p-3.5 border border-[#5A6D84] rounded-xl shadow-xs">
          <div className="relative flex-1 min-w-[240px]">
            <Search
              className="w-4 h-4 text-[#1E2B3C] absolute left-3.5 top-1/2 -translate-y-1/2"
              aria-hidden="true"
            />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Cerca per titolo, parola o contenuto..."
              className="w-full pl-10 pr-3.5 py-2 text-[15px] font-medium text-[#0B1320] bg-[#FAFBFD] border border-[#5A6D84] rounded-lg focus:outline-none focus:border-[#1E2B3C] focus:ring-1 focus:ring-[#1E2B3C]"
            />
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#B3C1D4] border border-[#5A6D84] rounded-lg">
            {(
              [
                { id: 'all', label: 'Tutte' },
                { id: 'ko', label: 'Coreano' },
                { id: 'zh', label: 'Cinese' },
              ] as const
            ).map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilterLang(f.id)}
                className={`px-3.5 py-2 text-sm font-bold rounded-md transition-colors cursor-pointer ${
                  filterLang === f.id
                    ? 'bg-[#1E2B3C] text-[#FFFFFF] shadow-xs'
                    : 'bg-[#F4F7FB] text-[#0B1320] hover:bg-[#E5ECF5] border border-[#94A3B8]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid or Empty State */}
        {filtered.length === 0 ? (
          <div className="bg-[#F4F7FB] border border-[#5A6D84] rounded-xl p-12 text-center space-y-3 shadow-xs">
            <h2 className="font-display text-xl font-bold text-[#0B1320]">
              Nessuna scheda trovata
            </h2>
            <p className="text-[15px] font-medium text-[#273549] max-w-md mx-auto">
              {savedCards.length === 0
                ? 'Non hai ancora salvato schede personalizzate. Crea la tua prima scheda nell’editor e clicca "Salva".'
                : 'Nessuna scheda corrisponde ai filtri attuali.'}
            </p>
            <button
              type="button"
              onClick={onBackToEditor}
              className="mt-2 px-5 py-2.5 text-sm font-bold text-white bg-[#C43B46] hover:bg-[#D64551] rounded-lg transition-colors cursor-pointer"
            >
              Crea Nuova Scheda
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((card) => (
              <article
                key={card.id}
                className="bg-[#F4F7FB] border border-[#5A6D84] rounded-xl overflow-hidden flex flex-col shadow-xs"
              >
                <CardThumbnail card={card} />
                <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                  <div>
                    <h3 className="text-base font-bold text-[#0B1320] truncate">
                      {card.name}
                    </h3>
                    <div className="flex items-center gap-2 text-sm font-medium text-[#273549] mt-1">
                      <span>{card.language === 'ko' ? 'Coreano' : 'Cinese'}</span>
                      <span aria-hidden="true">·</span>
                      <span className="capitalize">{card.template}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{card.aspectRatio}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-[#CBD5E1]">
                    <button
                      type="button"
                      onClick={() => onOpenCard(card)}
                      className="inline-flex items-center gap-1.5 text-sm font-bold text-[#B82937] hover:text-[#8F1D28] cursor-pointer"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Apri
                    </button>

                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => onExportCard(card)}
                        title="Scarica PNG HD"
                        className="p-2 text-[#1E2B3C] hover:text-[#0B1320] rounded-md bg-[#E6ECF5] hover:bg-[#D6E0EE] border border-[#94A3B8] cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDuplicateCard(card)}
                        title="Duplica"
                        className="p-2 text-[#1E2B3C] hover:text-[#0B1320] rounded-md bg-[#E6ECF5] hover:bg-[#D6E0EE] border border-[#94A3B8] cursor-pointer"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDeleteCard(card.id)}
                        title="Elimina"
                        className="p-2 text-[#1E2B3C] hover:text-[#B82937] rounded-md bg-[#E6ECF5] hover:bg-rose-100 border border-[#94A3B8] cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
