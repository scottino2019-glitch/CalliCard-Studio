import { useCallback, useEffect, useState } from 'react';
import { ArchiveView } from './components/ArchiveView';
import { CanvasStage, ExportFormat, ExportScale } from './components/CanvasStage';
import { InspectorPanel } from './components/InspectorPanel';
import { TopBar, WorkspaceView } from './components/TopBar';
import { CJK_FONTS } from './data/fonts';
import {
  COLOR_THEMES,
  CONTENT_PRESETS,
  ContentPresetItem,
  createInitialProject,
} from './data/presets';
import { CardProject, CardTemplate, LanguageMode } from './types/card';
import { ensureProjectFontsLoaded, renderCardToCanvas } from './utils/canvasRenderer';

const STORAGE_KEY = 'callicard_archive_v1';

function buildProjectFromPreset(preset: ContentPresetItem, idOverride?: string): CardProject {
  const base = createInitialProject();
  const theme = COLOR_THEMES.find((t) => t.id === preset.colorThemeId) || COLOR_THEMES[0];

  return {
    ...base,
    ...preset.patch,
    id: idOverride || `card-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    language: preset.language,
    template: preset.template,
    aspectRatio: preset.aspectRatio,
    colors: { ...theme.colors },
    typography: {
      ...base.typography,
      mainFont: preset.fontFamily,
      mainWeight: preset.fontWeight,
      sealEnabled: preset.sealEnabled ?? false,
      sealText: preset.sealText ?? (preset.language === 'ko' ? '한' : '道'),
      inkEffect: preset.inkEffect ?? 'clean',
      paperTexture: preset.paperTexture ?? 'none',
    },
    minimal: {
      ...base.minimal,
      ...(preset.patch.minimal || {}),
      verticalLayout: preset.verticalLayout ?? preset.patch.minimal?.verticalLayout ?? false,
    },
    updatedAt: Date.now(),
  };
}

function loadInitialArchive(): CardProject[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw !== null) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch {
    // ignore storage errors
  }
  // Seed initial archive with 1 Korean & 1 Chinese example on first visit
  return [
    buildProjectFromPreset(CONTENT_PRESETS[0], 'seed-ko-word'),
    buildProjectFromPreset(CONTENT_PRESETS[7], 'seed-zh-chengyu'),
    buildProjectFromPreset(CONTENT_PRESETS[4], 'seed-ko-dialogue'),
  ];
}

export default function App() {
  const [project, setProject] = useState<CardProject>(() => createInitialProject());
  const [activeView, setActiveView] = useState<WorkspaceView>('editor');
  const [exportScale, setExportScale] = useState<ExportScale>(2);
  const [exportFormat, setExportFormat] = useState<ExportFormat>('png');
  const [isExporting, setIsExporting] = useState(false);
  const [justSaved, setJustSaved] = useState(false);
  const [savedCards, setSavedCards] = useState<CardProject[]>(loadInitialArchive);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(savedCards));
    } catch {
      // ignore quota errors
    }
  }, [savedCards]);

  const handleChangeLanguage = useCallback((lang: LanguageMode) => {
    setProject((prev) => {
      if (prev.language === lang) return prev;
      const currentFont = CJK_FONTS.find((f) => f.family === prev.typography.mainFont);
      let nextFont = prev.typography.mainFont;
      let nextWeight = prev.typography.mainWeight;

      if (!currentFont || !currentFont.languages.includes(lang)) {
        const category = currentFont?.category || 'Moderno Sans';
        const match =
          CJK_FONTS.find((f) => f.languages.includes(lang) && f.category === category) ||
          CJK_FONTS.find((f) => f.languages.includes(lang));
        if (match) {
          nextFont = match.family;
          nextWeight = match.defaultWeight;
        }
      }

      return {
        ...prev,
        language: lang,
        typography: {
          ...prev.typography,
          mainFont: nextFont,
          mainWeight: nextWeight,
          sealText:
            prev.typography.sealText === '한' && lang === 'zh'
              ? '道'
              : prev.typography.sealText === '道' && lang === 'ko'
                ? '한'
                : prev.typography.sealText,
        },
        updatedAt: Date.now(),
      };
    });
  }, []);

  const handleSelectTemplate = useCallback((tpl: CardTemplate) => {
    setProject((prev) => ({
      ...prev,
      template: tpl,
      updatedAt: Date.now(),
    }));
    setActiveView('editor');
  }, []);

  const handleApplyPreset = useCallback((preset: ContentPresetItem) => {
    setProject((prev) => {
      const built = buildProjectFromPreset(preset, prev.id);
      return {
        ...prev,
        ...built,
        // Keep other templates' edited content intact while loading the preset's template data
        word: preset.patch.word ? preset.patch.word : prev.word,
        minimal: preset.patch.minimal ? preset.patch.minimal : prev.minimal,
        dialogue: preset.patch.dialogue ? preset.patch.dialogue : prev.dialogue,
        quiz: preset.patch.quiz ? preset.patch.quiz : prev.quiz,
      };
    });
    setActiveView('editor');
  }, []);

  const handleExportCard = useCallback(
    async (targetCard: CardProject) => {
      setIsExporting(true);
      try {
        await ensureProjectFontsLoaded(targetCard);
        const offscreen = document.createElement('canvas');
        renderCardToCanvas(offscreen, targetCard, exportScale);

        const mime =
          exportFormat === 'jpeg'
            ? 'image/jpeg'
            : exportFormat === 'webp'
              ? 'image/webp'
              : 'image/png';
        const ext = exportFormat === 'jpeg' ? 'jpg' : exportFormat;

        const blob = await new Promise<Blob | null>((resolve) =>
          offscreen.toBlob(resolve, mime, 0.96)
        );
        if (!blob) return;

        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        const safeName = (targetCard.name || 'callicard')
          .toLowerCase()
          .replace(/[^a-z0-9\u3131-\ud79d\u4e00-\u9fff]+/gi, '-')
          .replace(/^-|-$/g, '')
          .slice(0, 40);
        a.href = url;
        a.download = `${safeName || 'callicard'}-${exportScale}x.${ext}`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      } finally {
        setIsExporting(false);
      }
    },
    [exportFormat, exportScale]
  );

  const handleSaveToArchive = useCallback(() => {
    const snapshot: CardProject = {
      ...project,
      id:
        project.id === 'default-project'
          ? `card-${Date.now()}`
          : project.id,
      updatedAt: Date.now(),
    };
    setProject(snapshot);
    setSavedCards((prev) => {
      const existsIdx = prev.findIndex((c) => c.id === snapshot.id);
      if (existsIdx >= 0) {
        const next = [...prev];
        next[existsIdx] = snapshot;
        return next;
      }
      return [snapshot, ...prev];
    });
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 1800);
  }, [project]);

  const handleResetProject = useCallback(() => {
    setProject(createInitialProject());
  }, []);

  return (
    <div className="min-h-screen lg:h-screen flex flex-col bg-[#CFD9E6] text-[#0B1320] lg:overflow-hidden">
      <TopBar
        activeView={activeView}
        activeTemplate={project.template}
        savedCount={savedCards.length}
        onSelectTemplate={handleSelectTemplate}
        onSelectArchive={() => setActiveView('archive')}
        onQuickExport={() => handleExportCard(project)}
        isExporting={isExporting}
      />

      {activeView === 'editor' ? (
        <main className="flex-1 flex flex-col lg:flex-row min-h-0 lg:overflow-hidden">
          <CanvasStage
            project={project}
            exportScale={exportScale}
            exportFormat={exportFormat}
            onChangeScale={setExportScale}
            onChangeFormat={setExportFormat}
            onSaveToArchive={handleSaveToArchive}
            onResetProject={handleResetProject}
            onExport={() => handleExportCard(project)}
            isExporting={isExporting}
            justSaved={justSaved}
          />
          <InspectorPanel
            project={project}
            onChangeLanguage={handleChangeLanguage}
            onChangeTemplate={handleSelectTemplate}
            onApplyPreset={handleApplyPreset}
            onUpdateProject={(updater) =>
              setProject((prev) => ({ ...updater(prev), updatedAt: Date.now() }))
            }
          />
        </main>
      ) : (
        <ArchiveView
          savedCards={savedCards}
          onOpenCard={(card) => {
            setProject(card);
            setActiveView('editor');
          }}
          onDuplicateCard={(card) => {
            const copy: CardProject = {
              ...card,
              id: `card-${Date.now()}`,
              name: `${card.name} (Copia)`,
              updatedAt: Date.now(),
            };
            setSavedCards((prev) => [copy, ...prev]);
          }}
          onDeleteCard={(id) =>
            setSavedCards((prev) => prev.filter((c) => c.id !== id))
          }
          onExportCard={(card) => handleExportCard(card)}
          onBackToEditor={() => setActiveView('editor')}
        />
      )}
    </div>
  );
}
