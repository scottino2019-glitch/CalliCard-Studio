import { useEffect, useRef } from 'react';
import { Bookmark, Check, Download, RotateCcw } from 'lucide-react';
import { ASPECT_RATIOS } from '../data/presets';
import { CardProject } from '../types/card';
import { ensureProjectFontsLoaded, renderCardToCanvas } from '../utils/canvasRenderer';

export type ExportFormat = 'png' | 'jpeg' | 'webp';
export type ExportScale = 1 | 2 | 3;

interface CanvasStageProps {
  project: CardProject;
  exportScale: ExportScale;
  exportFormat: ExportFormat;
  onChangeScale: (scale: ExportScale) => void;
  onChangeFormat: (format: ExportFormat) => void;
  onSaveToArchive: () => void;
  onResetProject: () => void;
  onExport: () => void;
  isExporting: boolean;
  justSaved: boolean;
}

export function CanvasStage({
  project,
  exportScale,
  exportFormat,
  onChangeScale,
  onChangeFormat,
  onSaveToArchive,
  onResetProject,
  onExport,
  isExporting,
  justSaved,
}: CanvasStageProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ratioSpec = ASPECT_RATIOS[project.aspectRatio];
  const outputW = ratioSpec.width * exportScale;
  const outputH = ratioSpec.height * exportScale;

  useEffect(() => {
    let cancelled = false;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const previewDpr = Math.min(window.devicePixelRatio || 1, 2);
    renderCardToCanvas(canvas, project, previewDpr);

    ensureProjectFontsLoaded(project).then(() => {
      if (!cancelled && canvasRef.current) {
        renderCardToCanvas(canvasRef.current, project, previewDpr);
      }
    });

    return () => {
      cancelled = true;
    };
  }, [project]);

  return (
    <section className="flex-1 flex flex-col min-w-0 bg-[#B8C6D8]">
      {/* Solid Mid-Tone Slate Drafting Stage */}
      <div className="flex-1 studio-mat p-6 md:p-10 min-h-[400px] flex items-center justify-center overflow-auto">
        <div
          className="relative flex items-center justify-center shadow-[0_16px_40px_rgba(15,23,42,0.24)] ring-1 ring-[#64748B]"
          style={{
            aspectRatio: `${ratioSpec.width} / ${ratioSpec.height}`,
            maxWidth: '100%',
            maxHeight: '100%',
            width:
              ratioSpec.width >= ratioSpec.height
                ? 'min(100%, 780px)'
                : 'auto',
            height:
              ratioSpec.height > ratioSpec.width
                ? 'min(100%, 660px)'
                : 'auto',
          }}
        >
          <canvas
            ref={canvasRef}
            aria-label={`Anteprima scheda ${project.name}`}
            className="w-full h-full block object-contain"
          />
        </div>
      </div>

      {/* High-Clarity Slate Export Bar */}
      <div className="bg-[#CFD9E6] border-t border-[#64748B] px-5 py-3 flex flex-wrap items-center justify-between gap-4 shrink-0">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2 text-sm text-[#0B1320]">
            <span className="font-bold text-[#273549]">Output:</span>
            <span className="font-mono font-bold text-[#0B1320] tabular-nums">
              {outputW} × {outputH} px
            </span>
            <span aria-hidden="true" className="text-[#475569]">
              ·
            </span>
            <span className="font-bold text-[#1E2B3C]">{ratioSpec.label}</span>
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#B3C1D4] border border-[#5A6D84] rounded-lg">
            {([1, 2, 3] as ExportScale[]).map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onChangeScale(s)}
                className={`px-3 py-1.5 text-sm font-bold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer tabular-nums ${
                  exportScale === s
                    ? 'bg-[#1E2B3C] text-[#FFFFFF] shadow-xs'
                    : 'bg-[#F4F7FB] text-[#0B1320] hover:bg-[#E5ECF5] border border-[#94A3B8]'
                }`}
              >
                {s}x {s === 1 ? 'Base' : s === 2 ? 'HD' : 'Ultra'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1.5 p-1 bg-[#B3C1D4] border border-[#5A6D84] rounded-lg">
            {(['png', 'jpeg', 'webp'] as ExportFormat[]).map((fmt) => (
              <button
                key={fmt}
                type="button"
                onClick={() => onChangeFormat(fmt)}
                className={`px-3 py-1.5 text-sm font-bold uppercase rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  exportFormat === fmt
                    ? 'bg-[#1E2B3C] text-[#FFFFFF] shadow-xs'
                    : 'bg-[#F4F7FB] text-[#0B1320] hover:bg-[#E5ECF5] border border-[#94A3B8]'
                }`}
              >
                {fmt === 'jpeg' ? 'JPG' : fmt}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onResetProject}
            title="Ripristina scheda"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold text-[#0B1320] bg-[#F4F7FB] hover:bg-[#E5ECF5] border border-[#5A6D84] hover:border-[#1E2B3C] rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" aria-hidden="true" />
            <span>Ripristina</span>
          </button>

          <button
            type="button"
            onClick={onSaveToArchive}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold text-[#0B1320] bg-[#F4F7FB] hover:bg-[#E5ECF5] border border-[#5A6D84] hover:border-[#1E2B3C] rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            {justSaved ? (
              <>
                <Check className="w-4 h-4 text-emerald-700" aria-hidden="true" />
                <span className="text-emerald-800">Salvata</span>
              </>
            ) : (
              <>
                <Bookmark className="w-4 h-4" aria-hidden="true" />
                <span>Salva</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={onExport}
            disabled={isExporting}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-[#C43B46] hover:bg-[#D64551] disabled:opacity-60 rounded-lg shadow-xs transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <Download className="w-4 h-4" aria-hidden="true" />
            <span>
              {isExporting
                ? 'Generazione...'
                : `Scarica ${exportFormat === 'jpeg' ? 'JPG' : exportFormat.toUpperCase()}`}
            </span>
          </button>
        </div>
      </div>
    </section>
  );
}
