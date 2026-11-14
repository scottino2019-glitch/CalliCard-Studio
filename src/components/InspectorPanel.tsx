import { useState } from 'react';
import {
  AlignLeft,
  AlignRight,
  Check,
  FileText,
  Palette,
  Plus,
  Trash2,
  Type,
} from 'lucide-react';
import { CJK_FONTS, SECONDARY_FONTS } from '../data/fonts';
import {
  ASPECT_RATIOS,
  CALLIGRAPHIC_PRESETS,
  COLOR_THEMES,
  CONTENT_PRESETS,
  ContentPresetItem,
} from '../data/presets';
import {
  AspectRatioId,
  CardColors,
  CardProject,
  CardTemplate,
  CardTypography,
  InkEffect,
  LanguageMode,
  PaperTexture,
  SealPosition,
} from '../types/card';

type InspectorTab = 'content' | 'typography' | 'colors';

interface InspectorPanelProps {
  project: CardProject;
  onChangeLanguage: (lang: LanguageMode) => void;
  onChangeTemplate: (tpl: CardTemplate) => void;
  onApplyPreset: (preset: ContentPresetItem) => void;
  onUpdateProject: (updater: (prev: CardProject) => CardProject) => void;
}

const TABS: { id: InspectorTab; label: string; icon: typeof FileText }[] = [
  { id: 'content', label: 'Contenuto', icon: FileText },
  { id: 'typography', label: 'Font & Stile', icon: Type },
  { id: 'colors', label: 'Colori & Formato', icon: Palette },
];

export function InspectorPanel({
  project,
  onChangeLanguage,
  onChangeTemplate,
  onApplyPreset,
  onUpdateProject,
}: InspectorPanelProps) {
  const [activeTab, setActiveTab] = useState<InspectorTab>('content');
  const [showAllFonts, setShowAllFonts] = useState(false);

  const availableFonts = showAllFonts
    ? CJK_FONTS
    : CJK_FONTS.filter((f) => f.languages.includes(project.language));

  const currentFontSpec =
    CJK_FONTS.find((f) => f.family === project.typography.mainFont) || availableFonts[0];

  const matchingPresets = CONTENT_PRESETS.filter((p) => p.language === project.language);

  const updateTypography = (patch: Partial<CardTypography>) => {
    onUpdateProject((prev) => ({
      ...prev,
      typography: { ...prev.typography, ...patch },
    }));
  };

  const updateColors = (patch: Partial<CardColors>) => {
    onUpdateProject((prev) => ({
      ...prev,
      colors: { ...prev.colors, ...patch },
    }));
  };

  return (
    <aside className="w-full lg:w-[400px] xl:w-[420px] bg-[#CFD9E6] border-t lg:border-t-0 lg:border-l border-[#64748B] flex flex-col shrink-0 lg:h-full overflow-hidden">
      {/* Segmented Inspector Tabs */}
      <div className="px-4 pt-3.5 pb-3 border-b border-[#64748B] bg-[#BAC8DA] shrink-0">
        <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#9FB0C7] border border-[#5A6D84] rounded-lg">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 px-2.5 py-2 text-sm font-bold rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-[#1E2B3C] text-[#FFFFFF] shadow-xs'
                    : 'bg-[#F4F7FB] text-[#0B1320] hover:bg-[#E5ECF5] border border-[#7C8DA6]'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" aria-hidden="true" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scrollable Inspector Body */}
      <div className="flex-1 overflow-y-auto studio-scroll p-5 space-y-5">
        {activeTab === 'content' && (
          <>
            {/* Language Toggle */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#0B1320]">
                Lingua della Scheda
              </label>
              <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#B3C1D4] border border-[#5A6D84] rounded-lg">
                <button
                  type="button"
                  onClick={() => onChangeLanguage('ko')}
                  className={`py-2 px-3 text-sm font-bold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    project.language === 'ko'
                      ? 'bg-[#1E2B3C] text-[#FFFFFF] shadow-xs'
                      : 'bg-[#F4F7FB] text-[#0B1320] hover:bg-[#E5ECF5] border border-[#7C8DA6]'
                  }`}
                >
                  Coreano · 한국어
                </button>
                <button
                  type="button"
                  onClick={() => onChangeLanguage('zh')}
                  className={`py-2 px-3 text-sm font-bold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    project.language === 'zh'
                      ? 'bg-[#1E2B3C] text-[#FFFFFF] shadow-xs'
                      : 'bg-[#F4F7FB] text-[#0B1320] hover:bg-[#E5ECF5] border border-[#7C8DA6]'
                  }`}
                >
                  Cinese · 中文
                </button>
              </div>
            </div>

            {/* Quick Presets */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#0B1320]">
                Esempi Pronti ({project.language === 'ko' ? 'Coreano' : 'Cinese'})
              </label>
              <div className="grid grid-cols-2 gap-2">
                {matchingPresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => onApplyPreset(preset)}
                    className="text-left px-3 py-2 text-[13px] font-bold text-[#0B1320] bg-[#F4F7FB] hover:bg-[#E5ECF5] border border-[#5A6D84] hover:border-[#1E2B3C] rounded-lg shadow-xs transition-colors truncate cursor-pointer"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Template Picker */}
            <div className="space-y-2">
              <label className="block text-sm font-bold text-[#0B1320]">
                Modello Grafico
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(
                  [
                    { id: 'word', label: 'Scheda Parola', desc: 'Parola + esempi' },
                    { id: 'minimal', label: 'Parola Minimale', desc: 'Focus calligrafico' },
                    { id: 'dialogue', label: 'Dialogo Chat', desc: 'Bolle conversazione' },
                    { id: 'quiz', label: 'Quiz Scelta', desc: 'Domanda + opzioni' },
                  ] as const
                ).map((t) => {
                  const active = project.template === t.id;
                  return (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => onChangeTemplate(t.id)}
                      className={`text-left px-3 py-2.5 rounded-lg border shadow-xs transition-colors cursor-pointer ${
                        active
                          ? 'border-[#1E2B3C] bg-[#1E2B3C] text-[#FFFFFF]'
                          : 'border-[#5A6D84] bg-[#F4F7FB] hover:bg-[#E5ECF5] hover:border-[#1E2B3C] text-[#0B1320]'
                      }`}
                    >
                      <div className="text-sm font-bold">{t.label}</div>
                      <div
                        className={`text-[13px] mt-0.5 font-medium ${
                          active ? 'text-[#CBD5E1]' : 'text-[#273549]'
                        }`}
                      >
                        {t.desc}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-[#8D9EB5]" />

            {/* Template-Specific Fields */}
            {project.template === 'word' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between gap-4 bg-[#E3EAF4] p-3.5 rounded-lg border border-[#5A6D84]">
                  <label className="flex items-center gap-2.5 text-sm font-bold text-[#0B1320] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={project.word.showTopBar}
                      onChange={(e) =>
                        onUpdateProject((p) => ({
                          ...p,
                          word: { ...p.word, showTopBar: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 rounded border-[#475569] text-[#C43B46] focus:ring-[#C43B46]"
                    />
                    Barra superiore
                  </label>
                  <label className="flex items-center gap-2.5 text-sm font-bold text-[#0B1320] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={project.word.showBadge}
                      onChange={(e) =>
                        onUpdateProject((p) => ({
                          ...p,
                          word: { ...p.word, showBadge: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 rounded border-[#475569] text-[#C43B46] focus:ring-[#C43B46]"
                    />
                    Etichetta categoria
                  </label>
                </div>

                {project.word.showBadge && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-[#0B1320]">
                      Testo Etichetta (es. WORD, KONGLISH, HSK 4)
                    </label>
                    <input
                      type="text"
                      value={project.word.badgeText}
                      onChange={(e) =>
                        onUpdateProject((p) => ({
                          ...p,
                          word: { ...p.word, badgeText: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2.5 text-[15px] font-semibold text-[#0B1320] bg-[#FAFBFD] border border-[#5A6D84] rounded-lg focus:outline-none focus:bg-white focus:border-[#1E2B3C] focus:ring-1 focus:ring-[#1E2B3C]"
                      placeholder="WORD"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-[#0B1320]">
                    Parola / Espressione Principale
                  </label>
                  <input
                    type="text"
                    value={project.word.word}
                    onChange={(e) =>
                      onUpdateProject((p) => ({
                        ...p,
                        name: e.target.value || 'Scheda Parola',
                        word: { ...p.word, word: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 text-base font-bold text-[#0B1320] bg-[#FAFBFD] border border-[#5A6D84] rounded-lg focus:outline-none focus:bg-white focus:border-[#1E2B3C] focus:ring-1 focus:ring-[#1E2B3C]"
                    placeholder={project.language === 'ko' ? '노래방' : '充电宝'}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-[#0B1320]">
                    Pronuncia (Romanizzazione / Pinyin)
                  </label>
                  <input
                    type="text"
                    value={project.word.pronunciation}
                    onChange={(e) =>
                      onUpdateProject((p) => ({
                        ...p,
                        word: { ...p.word, pronunciation: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 text-[15px] font-medium text-[#0B1320] bg-[#FAFBFD] border border-[#5A6D84] rounded-lg focus:outline-none focus:bg-white focus:border-[#1E2B3C] focus:ring-1 focus:ring-[#1E2B3C]"
                    placeholder={project.language === 'ko' ? 'noraebang' : 'chōngdiànbǎo'}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-[#0B1320]">
                    Significato e Scomposizione
                  </label>
                  <textarea
                    rows={2}
                    value={project.word.meaning}
                    onChange={(e) =>
                      onUpdateProject((p) => ({
                        ...p,
                        word: { ...p.word, meaning: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 text-[15px] font-medium text-[#0B1320] bg-[#FAFBFD] border border-[#5A6D84] rounded-lg focus:outline-none focus:bg-white focus:border-[#1E2B3C] focus:ring-1 focus:ring-[#1E2B3C]"
                    placeholder="노래 song + 방 room: a private karaoke room"
                  />
                </div>

                <div className="pt-3 border-t border-[#8D9EB5] space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="flex items-center gap-2.5 text-sm font-bold text-[#0B1320] cursor-pointer">
                      <input
                        type="checkbox"
                        checked={project.word.showDivider}
                        onChange={(e) =>
                          onUpdateProject((p) => ({
                            ...p,
                            word: { ...p.word, showDivider: e.target.checked },
                          }))
                        }
                        className="w-4 h-4 rounded border-[#475569] text-[#C43B46] focus:ring-[#C43B46]"
                      />
                      Linea ed Esempi ({project.word.examples.length})
                    </label>
                    {project.word.examples.length < 4 && (
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateProject((p) => ({
                            ...p,
                            word: {
                              ...p.word,
                              examples: [
                                ...p.word.examples,
                                {
                                  id: `${Date.now()}`,
                                  term: '',
                                  meaning: '',
                                },
                              ],
                            },
                          }))
                        }
                        className="inline-flex items-center gap-1 text-sm font-bold text-[#B82937] hover:text-[#8F1D28] cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Aggiungi
                      </button>
                    )}
                  </div>

                  {project.word.examples.map((ex, idx) => (
                    <div
                      key={ex.id}
                      className="p-3.5 bg-[#E3EAF4] border border-[#5A6D84] rounded-lg space-y-2.5"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[13px] font-bold text-[#0B1320]">
                          Esempio {idx + 1}
                        </span>
                        <button
                          type="button"
                          onClick={() =>
                            onUpdateProject((p) => ({
                              ...p,
                              word: {
                                ...p.word,
                                examples: p.word.examples.filter((item) => item.id !== ex.id),
                              },
                            }))
                          }
                          className="text-[#273549] hover:text-[#B82937] cursor-pointer p-1"
                          aria-label={`Elimina esempio ${idx + 1}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <input
                        type="text"
                        value={ex.term}
                        onChange={(e) =>
                          onUpdateProject((p) => ({
                            ...p,
                            word: {
                              ...p.word,
                              examples: p.word.examples.map((item) =>
                                item.id === ex.id ? { ...item, term: e.target.value } : item
                              ),
                            },
                          }))
                        }
                        placeholder="Termine (es. PC방 (PC-bang))"
                        className="w-full px-3 py-2 text-sm font-semibold text-[#0B1320] bg-[#FAFBFD] border border-[#5A6D84] rounded-md focus:outline-none focus:bg-white focus:border-[#1E2B3C]"
                      />
                      <input
                        type="text"
                        value={ex.meaning}
                        onChange={(e) =>
                          onUpdateProject((p) => ({
                            ...p,
                            word: {
                              ...p.word,
                              examples: p.word.examples.map((item) =>
                                item.id === ex.id ? { ...item, meaning: e.target.value } : item
                              ),
                            },
                          }))
                        }
                        placeholder="Spiegazione"
                        className="w-full px-3 py-2 text-sm font-medium text-[#0B1320] bg-[#FAFBFD] border border-[#5A6D84] rounded-md focus:outline-none focus:bg-white focus:border-[#1E2B3C]"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {project.template === 'minimal' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-[#0B1320]">
                    Parola o Frase Calligrafica (Invio per più righe)
                  </label>
                  <textarea
                    rows={2}
                    value={project.minimal.word}
                    onChange={(e) =>
                      onUpdateProject((p) => ({
                        ...p,
                        name: e.target.value || 'Calligrafia Minimale',
                        minimal: { ...p.minimal, word: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 text-base font-bold text-[#0B1320] bg-[#FAFBFD] border border-[#5A6D84] rounded-lg focus:outline-none focus:bg-white focus:border-[#1E2B3C] focus:ring-1 focus:ring-[#1E2B3C]"
                    placeholder={project.language === 'ko' ? '설레다' : '缘分'}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-[#0B1320]">
                    Pronuncia (opzionale)
                  </label>
                  <input
                    type="text"
                    value={project.minimal.pronunciation}
                    onChange={(e) =>
                      onUpdateProject((p) => ({
                        ...p,
                        minimal: { ...p.minimal, pronunciation: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 text-[15px] font-medium text-[#0B1320] bg-[#FAFBFD] border border-[#5A6D84] rounded-lg focus:outline-none focus:bg-white focus:border-[#1E2B3C] focus:ring-1 focus:ring-[#1E2B3C]"
                    placeholder={project.language === 'ko' ? 'seolleoda' : 'yuánfèn'}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-[#0B1320]">
                    Traduzione o Sottotitolo (opzionale)
                  </label>
                  <input
                    type="text"
                    value={project.minimal.meaning}
                    onChange={(e) =>
                      onUpdateProject((p) => ({
                        ...p,
                        minimal: { ...p.minimal, meaning: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 text-[15px] font-medium text-[#0B1320] bg-[#FAFBFD] border border-[#5A6D84] rounded-lg focus:outline-none focus:bg-white focus:border-[#1E2B3C] focus:ring-1 focus:ring-[#1E2B3C]"
                    placeholder="Lascia vuoto per stile minimalista puro"
                  />
                </div>

                <label className="flex items-center justify-between p-3.5 bg-[#E3EAF4] border border-[#5A6D84] rounded-lg cursor-pointer">
                  <div>
                    <div className="text-sm font-bold text-[#0B1320]">
                      Scrittura Verticale Tradizionale
                    </div>
                    <div className="text-[13px] font-medium text-[#273549]">
                      Impila i caratteri in colonna da destra a sinistra
                    </div>
                  </div>
                  <input
                    type="checkbox"
                    checked={project.minimal.verticalLayout}
                    onChange={(e) =>
                      onUpdateProject((p) => ({
                        ...p,
                        minimal: { ...p.minimal, verticalLayout: e.target.checked },
                      }))
                    }
                    className="w-4 h-4 rounded border-[#475569] text-[#C43B46] focus:ring-[#C43B46]"
                  />
                </label>
              </div>
            )}

            {project.template === 'dialogue' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-[#E3EAF4] p-3.5 rounded-lg border border-[#5A6D84]">
                  <label className="flex items-center gap-2.5 text-sm font-bold text-[#0B1320] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={project.dialogue.showSubtext}
                      onChange={(e) =>
                        onUpdateProject((p) => ({
                          ...p,
                          dialogue: { ...p.dialogue, showSubtext: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 rounded border-[#475569] text-[#C43B46] focus:ring-[#C43B46]"
                    />
                    Mostra pronuncia
                  </label>
                  {project.dialogue.bubbles.length < 5 && (
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateProject((p) => ({
                          ...p,
                          dialogue: {
                            ...p.dialogue,
                            bubbles: [
                              ...p.dialogue.bubbles,
                              {
                                id: `b-${Date.now()}`,
                                side: p.dialogue.bubbles.length % 2 === 0 ? 'left' : 'right',
                                text:
                                  p.language === 'ko' ? '네, 좋아요!' : '好的，没问题！',
                                subtext:
                                  p.language === 'ko'
                                    ? 'ne, joayo!'
                                    : 'Hǎo de, méi wèntí!',
                                style:
                                  p.dialogue.bubbles.length % 2 === 0 ? 'outline' : 'filled',
                              },
                            ],
                          },
                        }))
                      }
                      className="inline-flex items-center gap-1 text-sm font-bold text-[#B82937] hover:text-[#8F1D28] cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      Nuova bolla
                    </button>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-bold text-[#0B1320]">Forma Bolle</span>
                    <span className="font-mono font-bold text-[#1E2B3C] tabular-nums">
                      {project.dialogue.bubbleRadius >= 900
                        ? 'Capsula'
                        : `${project.dialogue.bubbleRadius}px`}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#B3C1D4] border border-[#5A6D84] rounded-lg">
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateProject((p) => ({
                          ...p,
                          dialogue: { ...p.dialogue, bubbleRadius: 999 },
                        }))
                      }
                      className={`py-2 text-sm font-bold rounded-md cursor-pointer ${
                        project.dialogue.bubbleRadius >= 900
                          ? 'bg-[#1E2B3C] text-[#FFFFFF] shadow-xs'
                          : 'bg-[#F4F7FB] text-[#0B1320] hover:bg-[#E5ECF5] border border-[#7C8DA6]'
                      }`}
                    >
                      Capsula Rotonda
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        onUpdateProject((p) => ({
                          ...p,
                          dialogue: { ...p.dialogue, bubbleRadius: 28 },
                        }))
                      }
                      className={`py-2 text-sm font-bold rounded-md cursor-pointer ${
                        project.dialogue.bubbleRadius < 900
                          ? 'bg-[#1E2B3C] text-[#FFFFFF] shadow-xs'
                          : 'bg-[#F4F7FB] text-[#0B1320] hover:bg-[#E5ECF5] border border-[#7C8DA6]'
                      }`}
                    >
                      Angoli Morbidi
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {project.dialogue.bubbles.map((bubble, idx) => (
                    <div
                      key={bubble.id}
                      className="p-3.5 bg-[#E3EAF4] border border-[#5A6D84] rounded-lg space-y-2.5"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-bold text-[#0B1320]">
                          Battuta {idx + 1}
                        </span>
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateProject((p) => ({
                                ...p,
                                dialogue: {
                                  ...p.dialogue,
                                  bubbles: p.dialogue.bubbles.map((b) =>
                                    b.id === bubble.id
                                      ? { ...b, side: b.side === 'left' ? 'right' : 'left' }
                                      : b
                                  ),
                                },
                              }))
                            }
                            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-bold bg-[#FAFBFD] border border-[#5A6D84] rounded text-[#0B1320] hover:bg-[#E5ECF5] cursor-pointer"
                            title="Cambia allineamento"
                          >
                            {bubble.side === 'left' ? (
                              <>
                                <AlignLeft className="w-3.5 h-3.5" /> Sinistra
                              </>
                            ) : (
                              <>
                                <AlignRight className="w-3.5 h-3.5" /> Destra
                              </>
                            )}
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onUpdateProject((p) => ({
                                ...p,
                                dialogue: {
                                  ...p.dialogue,
                                  bubbles: p.dialogue.bubbles.map((b) =>
                                    b.id === bubble.id
                                      ? {
                                          ...b,
                                          style: b.style === 'outline' ? 'filled' : 'outline',
                                        }
                                      : b
                                  ),
                                },
                              }))
                            }
                            className={`px-2.5 py-1 text-xs font-bold border rounded cursor-pointer ${
                              bubble.style === 'filled'
                                ? 'bg-[#1E2B3C] border-[#1E2B3C] text-[#FFFFFF]'
                                : 'bg-[#FAFBFD] border-[#5A6D84] text-[#0B1320] hover:bg-[#E5ECF5]'
                            }`}
                          >
                            {bubble.style === 'outline' ? 'Contorno' : 'Pieno'}
                          </button>
                          {project.dialogue.bubbles.length > 1 && (
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateProject((p) => ({
                                  ...p,
                                  dialogue: {
                                    ...p.dialogue,
                                    bubbles: p.dialogue.bubbles.filter((b) => b.id !== bubble.id),
                                  },
                                }))
                              }
                              className="text-[#273549] hover:text-[#B82937] p-1 cursor-pointer"
                              aria-label="Elimina battuta"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>

                      <input
                        type="text"
                        value={bubble.text}
                        onChange={(e) =>
                          onUpdateProject((p) => ({
                            ...p,
                            dialogue: {
                              ...p.dialogue,
                              bubbles: p.dialogue.bubbles.map((b) =>
                                b.id === bubble.id ? { ...b, text: e.target.value } : b
                              ),
                            },
                          }))
                        }
                        placeholder="Testo del dialogo"
                        className="w-full px-3 py-2 text-[15px] font-semibold text-[#0B1320] bg-[#FAFBFD] border border-[#5A6D84] rounded-md focus:outline-none focus:bg-white focus:border-[#1E2B3C]"
                      />

                      {project.dialogue.showSubtext && (
                        <input
                          type="text"
                          value={bubble.subtext}
                          onChange={(e) =>
                            onUpdateProject((p) => ({
                              ...p,
                              dialogue: {
                                ...p.dialogue,
                                bubbles: p.dialogue.bubbles.map((b) =>
                                  b.id === bubble.id ? { ...b, subtext: e.target.value } : b
                                ),
                              },
                            }))
                          }
                          placeholder="Pinyin / romanizzazione / traduzione"
                          className="w-full px-3 py-2 text-sm font-medium text-[#0B1320] bg-[#FAFBFD] border border-[#5A6D84] rounded-md focus:outline-none focus:bg-white focus:border-[#1E2B3C]"
                        />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {project.template === 'quiz' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 bg-[#E3EAF4] p-3.5 rounded-lg border border-[#5A6D84]">
                  <label className="flex items-center gap-2.5 text-sm font-bold text-[#0B1320] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={project.quiz.showTopBar}
                      onChange={(e) =>
                        onUpdateProject((p) => ({
                          ...p,
                          quiz: { ...p.quiz, showTopBar: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 rounded border-[#475569] text-[#C43B46] focus:ring-[#C43B46]"
                    />
                    Barra superiore
                  </label>
                  <label className="flex items-center gap-2.5 text-sm font-bold text-[#0B1320] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={project.quiz.showWatermark}
                      onChange={(e) =>
                        onUpdateProject((p) => ({
                          ...p,
                          quiz: { ...p.quiz, showWatermark: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 rounded border-[#475569] text-[#C43B46] focus:ring-[#C43B46]"
                    />
                    Simbolo «?»
                  </label>
                  <label className="flex items-center gap-2.5 text-sm font-bold text-[#0B1320] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={project.quiz.showBadge}
                      onChange={(e) =>
                        onUpdateProject((p) => ({
                          ...p,
                          quiz: { ...p.quiz, showBadge: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 rounded border-[#475569] text-[#C43B46] focus:ring-[#C43B46]"
                    />
                    Etichetta QUIZ
                  </label>
                  <label className="flex items-center gap-2.5 text-sm font-bold text-[#0B1320] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={project.quiz.highlightCorrect}
                      onChange={(e) =>
                        onUpdateProject((p) => ({
                          ...p,
                          quiz: { ...p.quiz, highlightCorrect: e.target.checked },
                        }))
                      }
                      className="w-4 h-4 rounded border-[#475569] text-[#C43B46] focus:ring-[#C43B46]"
                    />
                    Mostra soluzione
                  </label>
                </div>

                {project.quiz.showBadge && (
                  <div className="space-y-1.5">
                    <label className="block text-sm font-bold text-[#0B1320]">
                      Testo Etichetta
                    </label>
                    <input
                      type="text"
                      value={project.quiz.badgeText}
                      onChange={(e) =>
                        onUpdateProject((p) => ({
                          ...p,
                          quiz: { ...p.quiz, badgeText: e.target.value },
                        }))
                      }
                      className="w-full px-3.5 py-2.5 text-[15px] font-semibold text-[#0B1320] bg-[#FAFBFD] border border-[#5A6D84] rounded-lg focus:outline-none focus:bg-white focus:border-[#1E2B3C]"
                    />
                  </div>
                )}

                <div className="space-y-1.5">
                  <label className="block text-sm font-bold text-[#0B1320]">
                    Domanda del Quiz
                  </label>
                  <textarea
                    rows={3}
                    value={project.quiz.question}
                    onChange={(e) =>
                      onUpdateProject((p) => ({
                        ...p,
                        quiz: { ...p.quiz, question: e.target.value },
                      }))
                    }
                    className="w-full px-3.5 py-2.5 text-[15px] font-medium text-[#0B1320] bg-[#FAFBFD] border border-[#5A6D84] rounded-lg focus:outline-none focus:bg-white focus:border-[#1E2B3C]"
                  />
                </div>

                <div className="pt-3 border-t border-[#8D9EB5] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#0B1320]">
                      Opzioni di Risposta ({project.quiz.options.length})
                    </span>
                    {project.quiz.options.length < 4 && (
                      <button
                        type="button"
                        onClick={() => {
                          const labels = ['A', 'B', 'C', 'D'];
                          const nextLabel = labels[project.quiz.options.length] || 'D';
                          onUpdateProject((p) => ({
                            ...p,
                            quiz: {
                              ...p.quiz,
                              options: [
                                ...p.quiz.options,
                                {
                                  id: `o-${Date.now()}`,
                                  label: nextLabel,
                                  text: '',
                                  isCorrect: false,
                                },
                              ],
                            },
                          }));
                        }}
                        className="inline-flex items-center gap-1 text-sm font-bold text-[#B82937] hover:text-[#8F1D28] cursor-pointer"
                      >
                        <Plus className="w-4 h-4" />
                        Aggiungi
                      </button>
                    )}
                  </div>

                  {project.quiz.options.map((opt, idx) => (
                    <div
                      key={opt.id}
                      className="flex items-center gap-2.5 p-2.5 bg-[#E3EAF4] border border-[#5A6D84] rounded-lg"
                    >
                      <button
                        type="button"
                        onClick={() =>
                          onUpdateProject((p) => ({
                            ...p,
                            quiz: {
                              ...p.quiz,
                              options: p.quiz.options.map((o) => ({
                                ...o,
                                isCorrect: o.id === opt.id,
                              })),
                            },
                          }))
                        }
                        title="Segna come risposta corretta"
                        className={`w-8 h-8 rounded-full text-sm font-bold flex items-center justify-center shrink-0 cursor-pointer transition-colors ${
                          opt.isCorrect
                            ? 'bg-emerald-700 text-white'
                            : 'bg-[#FAFBFD] text-[#0B1320] border border-[#5A6D84] hover:bg-[#D2DCE9]'
                        }`}
                      >
                        {opt.label}
                      </button>
                      <input
                        type="text"
                        value={opt.text}
                        onChange={(e) =>
                          onUpdateProject((p) => ({
                            ...p,
                            quiz: {
                              ...p.quiz,
                              options: p.quiz.options.map((o) =>
                                o.id === opt.id ? { ...o, text: e.target.value } : o
                              ),
                            },
                          }))
                        }
                        placeholder={`Opzione ${idx + 1}`}
                        className="flex-1 px-3 py-2 text-[15px] font-medium text-[#0B1320] bg-[#FAFBFD] border border-[#5A6D84] rounded-md focus:outline-none focus:bg-white focus:border-[#1E2B3C]"
                      />
                      {project.quiz.options.length > 2 && (
                        <button
                          type="button"
                          onClick={() => {
                            const labels = ['A', 'B', 'C', 'D'];
                            onUpdateProject((p) => ({
                              ...p,
                              quiz: {
                                ...p.quiz,
                                options: p.quiz.options
                                  .filter((o) => o.id !== opt.id)
                                  .map((o, i) => ({ ...o, label: labels[i] || o.label })),
                              },
                            }));
                          }}
                          className="text-[#273549] hover:text-[#B82937] p-1.5 cursor-pointer"
                          aria-label="Elimina opzione"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'typography' && (
          <>
            {/* Calligraphic Style Presets */}
            <div className="space-y-2.5">
              <label className="block text-sm font-bold text-[#0B1320]">
                Stili Calligrafici Rapidi
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {CALLIGRAPHIC_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => updateTypography(preset.apply(project.language))}
                    className="text-left p-3 rounded-lg bg-[#F4F7FB] border border-[#5A6D84] hover:border-[#1E2B3C] hover:bg-[#E5ECF5] shadow-xs transition-colors cursor-pointer"
                  >
                    <div className="text-sm font-bold text-[#0B1320]">
                      {preset.name}
                    </div>
                    <div className="text-[13px] font-medium text-[#273549] mt-1 leading-snug">
                      {preset.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <hr className="border-[#8D9EB5]" />

            {/* Main Font Picker with Live Specimen */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-[#0B1320]">
                  Font Principale ({project.language === 'ko' ? 'Coreano' : 'Cinese'})
                </label>
                <button
                  type="button"
                  onClick={() => setShowAllFonts((v) => !v)}
                  className="text-xs font-bold text-[#B82937] hover:text-[#8F1D28] cursor-pointer underline underline-offset-2"
                >
                  {showAllFonts ? 'Solo lingua attiva' : 'Mostra tutti i font'}
                </button>
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto studio-scroll pr-1">
                {availableFonts.map((font) => {
                  const isSelected = project.typography.mainFont === font.family;
                  const specimen =
                    font.languages.includes('ko') && project.language === 'ko'
                      ? font.sampleKo
                      : font.sampleZh || font.sampleKo;
                  return (
                    <button
                      key={font.id}
                      type="button"
                      onClick={() => {
                        const weight = font.weights.includes(project.typography.mainWeight)
                          ? project.typography.mainWeight
                          : font.defaultWeight;
                        updateTypography({ mainFont: font.family, mainWeight: weight });
                      }}
                      className={`w-full text-left px-3.5 py-3 rounded-lg border shadow-xs transition-colors flex items-center justify-between gap-3 cursor-pointer ${
                        isSelected
                          ? 'border-[#1E2B3C] bg-[#1E2B3C] text-[#FFFFFF]'
                          : 'border-[#5A6D84] bg-[#F4F7FB] hover:border-[#1E2B3C] hover:bg-[#E5ECF5] text-[#0B1320]'
                      }`}
                    >
                      <div className="min-w-0">
                        <div className="text-sm font-bold truncate">
                          {font.label}
                        </div>
                        <div
                          className={`text-[13px] mt-0.5 leading-snug font-medium ${
                            isSelected ? 'text-[#CBD5E1]' : 'text-[#273549]'
                          }`}
                        >
                          {font.category} · {font.description}
                        </div>
                      </div>
                      <div
                        className="text-xl shrink-0 pl-2"
                        style={{
                          fontFamily: `"${font.family}", sans-serif`,
                          fontWeight: font.defaultWeight,
                        }}
                      >
                        {specimen.split('·')[0].trim()}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Weight & Secondary Font */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-[#0B1320]">
                  Spessore Tratto
                </label>
                <select
                  value={project.typography.mainWeight}
                  onChange={(e) =>
                    updateTypography({
                      mainWeight: e.target.value as CardTypography['mainWeight'],
                    })
                  }
                  className="w-full px-3 py-2.5 text-sm font-bold text-[#0B1320] bg-[#FAFBFD] border border-[#5A6D84] rounded-lg focus:outline-none focus:border-[#1E2B3C]"
                >
                  {(currentFontSpec?.weights || ['400', '700']).map((w) => (
                    <option key={w} value={w}>
                      {w === '400'
                        ? '400 · Regolare'
                        : w === '500'
                          ? '500 · Medio'
                          : w === '600'
                            ? '600 · Semibold'
                            : w === '700'
                              ? '700 · Grassetto'
                              : '900 · Black'}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-bold text-[#0B1320]">
                  Font Secondario
                </label>
                <select
                  value={project.typography.secondaryFont}
                  onChange={(e) => updateTypography({ secondaryFont: e.target.value })}
                  className="w-full px-3 py-2.5 text-sm font-bold text-[#0B1320] bg-[#FAFBFD] border border-[#5A6D84] rounded-lg focus:outline-none focus:border-[#1E2B3C]"
                >
                  {SECONDARY_FONTS.map((sf) => (
                    <option key={sf.id} value={sf.id}>
                      {sf.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Typographic Fine-Tuning Sliders */}
            <div className="space-y-4 p-4 bg-[#E3EAF4] border border-[#5A6D84] rounded-lg">
              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-[#0B1320]">Dimensione Carattere</span>
                  <span className="font-mono font-bold text-[#1E2B3C] tabular-nums">
                    {Math.round(project.typography.mainScale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.65}
                  max={1.45}
                  step={0.05}
                  value={project.typography.mainScale}
                  onChange={(e) => updateTypography({ mainScale: parseFloat(e.target.value) })}
                  className="w-full accent-[#C43B46] cursor-pointer"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-bold text-[#0B1320]">Dimensione Testo Secondario</span>
                  <span className="font-mono font-bold text-[#1E2B3C] tabular-nums">
                    {Math.round(project.typography.secondaryScale * 100)}%
                  </span>
                </div>
                <input
                  type="range"
                  min={0.75}
                  max={1.35}
                  step={0.05}
                  value={project.typography.secondaryScale}
                  onChange={(e) =>
                    updateTypography({ secondaryScale: parseFloat(e.target.value) })
                  }
                  className="w-full accent-[#C43B46] cursor-pointer"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-[#0B1320]">Spaziatura</span>
                    <span className="font-mono font-bold text-[#1E2B3C] tabular-nums">
                      {project.typography.letterSpacing.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-0.05}
                    max={0.25}
                    step={0.01}
                    value={project.typography.letterSpacing}
                    onChange={(e) =>
                      updateTypography({ letterSpacing: parseFloat(e.target.value) })
                    }
                    className="w-full accent-[#C43B46] cursor-pointer"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-sm">
                    <span className="font-bold text-[#0B1320]">Interlinea</span>
                    <span className="font-mono font-bold text-[#1E2B3C] tabular-nums">
                      {project.typography.lineHeight.toFixed(2)}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={1.0}
                    max={1.75}
                    step={0.05}
                    value={project.typography.lineHeight}
                    onChange={(e) =>
                      updateTypography({ lineHeight: parseFloat(e.target.value) })
                    }
                    className="w-full accent-[#C43B46] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Ink & Paper Texture */}
            <div className="space-y-3.5">
              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#0B1320]">
                  Effetto Inchiostro Calligrafico
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#B3C1D4] border border-[#5A6D84] rounded-lg">
                  {(
                    [
                      { id: 'clean', label: 'Nitido' },
                      { id: 'soft-ink', label: 'Morbido' },
                      { id: 'brush-bleed', label: 'Pennello' },
                    ] as { id: InkEffect; label: string }[]
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateTypography({ inkEffect: item.id })}
                      className={`py-2 text-sm font-bold rounded-md cursor-pointer transition-colors ${
                        project.typography.inkEffect === item.id
                          ? 'bg-[#1E2B3C] text-[#FFFFFF] shadow-xs'
                          : 'bg-[#F4F7FB] text-[#0B1320] hover:bg-[#E5ECF5] border border-[#7C8DA6]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-bold text-[#0B1320]">
                  Texture Carta della Card
                </label>
                <div className="grid grid-cols-3 gap-1.5 p-1 bg-[#B3C1D4] border border-[#5A6D84] rounded-lg">
                  {(
                    [
                      { id: 'none', label: 'Liscia' },
                      { id: 'hanji', label: 'Carta Hanji' },
                      { id: 'editorial', label: 'Editoriale' },
                    ] as { id: PaperTexture; label: string }[]
                  ).map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => updateTypography({ paperTexture: item.id })}
                      className={`py-2 text-sm font-bold rounded-md cursor-pointer transition-colors ${
                        project.typography.paperTexture === item.id
                          ? 'bg-[#1E2B3C] text-[#FFFFFF] shadow-xs'
                          : 'bg-[#F4F7FB] text-[#0B1320] hover:bg-[#E5ECF5] border border-[#7C8DA6]'
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Traditional Red Chop Seal */}
            <div className="p-4 bg-[#E3EAF4] border border-[#5A6D84] rounded-lg space-y-3">
              <label className="flex items-center justify-between cursor-pointer">
                <div>
                  <div className="text-sm font-bold text-[#0B1320]">
                    Sigillo Rosso Calligrafico (印章)
                  </div>
                  <div className="text-[13px] font-medium text-[#273549]">
                    Aggiunge un timbro tradizionale a inchiostro rosso
                  </div>
                </div>
                <input
                  type="checkbox"
                  checked={project.typography.sealEnabled}
                  onChange={(e) => updateTypography({ sealEnabled: e.target.checked })}
                  className="w-4 h-4 rounded border-[#475569] text-[#C43B46] focus:ring-[#C43B46]"
                />
              </label>

              {project.typography.sealEnabled && (
                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0B1320]">
                      Caratteri (1-2)
                    </label>
                    <input
                      type="text"
                      maxLength={2}
                      value={project.typography.sealText}
                      onChange={(e) => updateTypography({ sealText: e.target.value })}
                      className="w-full px-3 py-2 text-base font-bold text-[#0B1320] bg-[#FAFBFD] border border-[#5A6D84] rounded-md focus:outline-none focus:bg-white focus:border-[#1E2B3C]"
                      placeholder="道"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#0B1320]">
                      Posizione
                    </label>
                    <select
                      value={project.typography.sealPosition}
                      onChange={(e) =>
                        updateTypography({ sealPosition: e.target.value as SealPosition })
                      }
                      className="w-full px-3 py-2 text-sm font-bold text-[#0B1320] bg-[#FAFBFD] border border-[#5A6D84] rounded-md focus:outline-none focus:bg-white focus:border-[#1E2B3C]"
                    >
                      <option value="bottom-right">Basso Destra</option>
                      <option value="bottom-left">Basso Sinistra</option>
                      <option value="top-right">Alto Destra</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </>
        )}

        {activeTab === 'colors' && (
          <>
            {/* Aspect Ratio Selector */}
            <div className="space-y-2.5">
              <label className="block text-sm font-bold text-[#0B1320]">
                Formato & Proporzioni
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {(Object.keys(ASPECT_RATIOS) as AspectRatioId[]).map((ratioId) => {
                  const spec = ASPECT_RATIOS[ratioId];
                  const active = project.aspectRatio === ratioId;
                  return (
                    <button
                      key={ratioId}
                      type="button"
                      onClick={() =>
                        onUpdateProject((p) => ({ ...p, aspectRatio: ratioId }))
                      }
                      className={`text-left px-3.5 py-2.5 rounded-lg border shadow-xs transition-colors cursor-pointer ${
                        active
                          ? 'border-[#1E2B3C] bg-[#1E2B3C] text-[#FFFFFF]'
                          : 'border-[#5A6D84] bg-[#F4F7FB] hover:bg-[#E5ECF5] hover:border-[#1E2B3C] text-[#0B1320]'
                      }`}
                    >
                      <div className="text-sm font-bold">{spec.label}</div>
                      <div
                        className={`text-xs font-mono tabular-nums mt-0.5 ${
                          active ? 'text-[#CBD5E1]' : 'text-[#273549]'
                        }`}
                      >
                        {spec.sublabel}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-[#8D9EB5]" />

            {/* Curated Color Themes */}
            <div className="space-y-2.5">
              <label className="block text-sm font-bold text-[#0B1320]">
                Palette Colori Predefinite
              </label>
              <div className="grid grid-cols-2 gap-2.5">
                {COLOR_THEMES.map((theme) => {
                  const isMatch =
                    theme.colors.background.toLowerCase() ===
                      project.colors.background.toLowerCase() &&
                    theme.colors.accent.toLowerCase() ===
                      project.colors.accent.toLowerCase();
                  return (
                    <button
                      key={theme.id}
                      type="button"
                      onClick={() => updateColors({ ...theme.colors })}
                      className={`text-left p-3 rounded-lg border shadow-xs transition-colors cursor-pointer ${
                        isMatch
                          ? 'border-[#1E2B3C] bg-[#1E2B3C] text-[#FFFFFF]'
                          : 'border-[#5A6D84] bg-[#F4F7FB] hover:bg-[#E5ECF5] hover:border-[#1E2B3C] text-[#0B1320]'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className="w-5 h-5 rounded-full border border-[#475569]"
                            style={{ backgroundColor: theme.colors.background }}
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-[#475569]"
                            style={{ backgroundColor: theme.colors.primaryText }}
                          />
                          <span
                            className="w-5 h-5 rounded-full border border-[#475569]"
                            style={{ backgroundColor: theme.colors.accent }}
                          />
                        </div>
                        {isMatch && <Check className="w-4 h-4 text-[#FCA5A5]" />}
                      </div>
                      <div className="text-[13px] font-bold truncate">
                        {theme.name}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <hr className="border-[#8D9EB5]" />

            {/* Custom Color Pickers */}
            <div className="space-y-3 bg-[#E3EAF4] p-4 rounded-lg border border-[#5A6D84]">
              <label className="block text-sm font-bold text-[#0B1320] pb-1">
                Personalizzazione Colori Card & Font
              </label>

              {(
                [
                  { key: 'background', label: 'Colore Sfondo Card' },
                  { key: 'primaryText', label: 'Colore Font Principale' },
                  { key: 'accent', label: 'Colore Accento / Pronuncia' },
                  { key: 'secondaryText', label: 'Colore Testo Secondario' },
                  { key: 'border', label: 'Colore Bordi & Linee' },
                  { key: 'surface', label: 'Colore Box / Bolle Chiare' },
                ] as { key: keyof CardColors; label: string }[]
              ).map(({ key, label }) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-3 py-1"
                >
                  <span className="text-sm font-bold text-[#0B1320]">{label}</span>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      aria-label={label}
                      value={project.colors[key]}
                      onChange={(e) => updateColors({ [key]: e.target.value })}
                      className="w-9 h-9 rounded border border-[#5A6D84] cursor-pointer bg-transparent p-0.5"
                    />
                    <input
                      type="text"
                      value={project.colors[key].toUpperCase()}
                      onChange={(e) => {
                        const val = e.target.value;
                        if (/^#[0-9A-Fa-f]{0,6}$/.test(val)) {
                          updateColors({ [key]: val });
                        }
                      }}
                      className="w-24 px-2.5 py-1.5 text-sm font-mono font-bold uppercase text-[#0B1320] bg-[#FAFBFD] border border-[#5A6D84] rounded focus:outline-none focus:bg-white focus:border-[#1E2B3C]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </aside>
  );
}
