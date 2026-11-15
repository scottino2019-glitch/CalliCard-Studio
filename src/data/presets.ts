import {
  AspectRatioId,
  AspectRatioSpec,
  CardColors,
  CardProject,
  CardTemplate,
  CardTypography,
  LanguageMode,
} from '../types/card';

export const ASPECT_RATIOS: Record<AspectRatioId, AspectRatioSpec> = {
  '1:1': {
    id: '1:1',
    label: '1:1 Quadrato',
    sublabel: '1080 × 1080 base',
    width: 1080,
    height: 1080,
  },
  '4:3': {
    id: '4:3',
    label: '4:3 Editoriale',
    sublabel: '1440 × 1080 base',
    width: 1440,
    height: 1080,
  },
  '4:5': {
    id: '4:5',
    label: '4:5 Ritratto IG',
    sublabel: '1080 × 1350 base',
    width: 1080,
    height: 1350,
  },
  '9:16': {
    id: '9:16',
    label: '9:16 Storie',
    sublabel: '1080 × 1920 base',
    width: 1080,
    height: 1920,
  },
  '16:9': {
    id: '16:9',
    label: '16:9 Slide HD',
    sublabel: '1920 × 1080 base',
    width: 1920,
    height: 1080,
  },
};

export interface ColorThemePreset {
  id: string;
  name: string;
  colors: CardColors;
}

export const COLOR_THEMES: ColorThemePreset[] = [
  {
    id: 'editorial-slate',
    name: 'Ardesia & Rosso (Scheda)',
    colors: {
      background: '#F0F3F8',
      primaryText: '#132238',
      accent: '#CC2936',
      secondaryText: '#5E6B7B',
      border: '#0F4C81',
      surface: '#FFFFFF',
    },
  },
  {
    id: 'warm-cream',
    name: 'Crema Hanji (Minimale)',
    colors: {
      background: '#EFE9DE',
      primaryText: '#1A1A1A',
      accent: '#A82E2B',
      secondaryText: '#5C554B',
      border: '#4A4A4A',
      surface: '#FFFFFF',
    },
  },
  {
    id: 'rice-paper-ink',
    name: 'Carta Riso & Cinabro',
    colors: {
      background: '#F7F2E7',
      primaryText: '#1C1917',
      accent: '#B91C1C',
      secondaryText: '#57534E',
      border: '#78716C',
      surface: '#FFFDF8',
    },
  },
  {
    id: 'night-ink',
    name: 'Notte Seoul / Shanghai',
    colors: {
      background: '#111827',
      primaryText: '#F8FAFC',
      accent: '#F43F5E',
      secondaryText: '#94A3B8',
      border: '#334155',
      surface: '#1E293B',
    },
  },
  {
    id: 'celadon-jade',
    name: 'Giada Celadon',
    colors: {
      background: '#E8EFEA',
      primaryText: '#142B24',
      accent: '#1F6E58',
      secondaryText: '#49635B',
      border: '#2B5B4E',
      surface: '#F7FAF8',
    },
  },
  {
    id: 'terracotta-soft',
    name: 'Argilla Calda',
    colors: {
      background: '#F4EAE4',
      primaryText: '#2A1D18',
      accent: '#B4432C',
      secondaryText: '#6F584F',
      border: '#8C6D62',
      surface: '#FFFBF9',
    },
  },
];

export interface CalligraphicPreset {
  id: string;
  name: string;
  description: string;
  apply: (lang: LanguageMode) => Partial<CardTypography>;
}

export const CALLIGRAPHIC_PRESETS: CalligraphicPreset[] = [
  {
    id: 'modern-editorial',
    name: 'Editoriale Nitido',
    description: 'Sans geometrico pulito, ideale per schede studio.',
    apply: (lang) => ({
      mainFont: lang === 'ko' ? 'Noto Sans KR' : 'Noto Sans SC',
      mainWeight: '700',
      secondaryFont: 'Plus Jakarta Sans',
      inkEffect: 'clean',
      paperTexture: 'none',
      sealEnabled: false,
      letterSpacing: 0,
    }),
  },
  {
    id: 'brush-ink',
    name: 'Pennello & Inchiostro',
    description: 'Calligrafia a pennello con texture carta e alone d’inchiostro.',
    apply: (lang) => ({
      mainFont: lang === 'ko' ? 'Nanum Brush Script' : 'Ma Shan Zheng',
      mainWeight: '400',
      secondaryFont: 'Noto Serif SC',
      inkEffect: 'brush-bleed',
      paperTexture: 'hanji',
      sealEnabled: true,
      sealText: lang === 'ko' ? '한' : '道',
      letterSpacing: 0.04,
    }),
  },
  {
    id: 'classic-seal',
    name: 'Classico & Sigillo',
    description: 'Serif letterario con carta editoriale e timbro rosso.',
    apply: (lang) => ({
      mainFont: lang === 'ko' ? 'Song Myung' : 'Noto Serif SC',
      mainWeight: lang === 'ko' ? '400' : '700',
      secondaryFont: 'Noto Serif SC',
      inkEffect: 'soft-ink',
      paperTexture: 'editorial',
      sealEnabled: true,
      sealText: lang === 'ko' ? '語' : '文',
      letterSpacing: 0.02,
    }),
  },
  {
    id: 'handwritten-script',
    name: 'Manoscritto Fluido',
    description: 'Scrittura corsiva espressiva a mano libera.',
    apply: (lang) => ({
      mainFont: lang === 'ko' ? 'Nanum Pen Script' : 'Zhi Mang Xing',
      mainWeight: '400',
      secondaryFont: 'DM Sans',
      inkEffect: 'soft-ink',
      paperTexture: 'hanji',
      sealEnabled: false,
      letterSpacing: 0.02,
    }),
  },
];

export interface ContentPresetItem {
  id: string;
  label: string;
  language: LanguageMode;
  template: CardTemplate;
  aspectRatio: AspectRatioId;
  colorThemeId: string;
  fontFamily: string;
  fontWeight: '400' | '500' | '600' | '700' | '900';
  sealEnabled?: boolean;
  sealText?: string;
  inkEffect?: 'clean' | 'soft-ink' | 'brush-bleed';
  paperTexture?: 'none' | 'hanji' | 'editorial';
  verticalLayout?: boolean;
  patch: Partial<CardProject>;
}

export const CONTENT_PRESETS: ContentPresetItem[] = [
  // KOREAN PRESETS (matching all 5 uploaded references!)
  {
    id: 'ko-word-noraebang',
    label: '노래방 (Scheda Parola)',
    language: 'ko',
    template: 'word',
    aspectRatio: '4:3',
    colorThemeId: 'editorial-slate',
    fontFamily: 'Noto Sans KR',
    fontWeight: '700',
    patch: {
      name: '노래방 — Scheda Parola',
      word: {
        showTopBar: true,
        showBadge: true,
        badgeText: 'WORD',
        word: '노래방',
        pronunciation: 'noraebang',
        meaning: '노래 song + 방 room: a private karaoke room',
        showDivider: true,
        examples: [
          { id: '1', term: 'PC방 (PC-bang)', meaning: 'internet café for gamers' },
          { id: '2', term: '찜질방 (jjimjilbang)', meaning: 'bathhouse with saunas, open all night' },
        ],
      },
    },
  },
  {
    id: 'ko-word-konglish',
    label: '핸드폰 (Konglish)',
    language: 'ko',
    template: 'word',
    aspectRatio: '4:3',
    colorThemeId: 'editorial-slate',
    fontFamily: 'Noto Sans KR',
    fontWeight: '700',
    patch: {
      name: '핸드폰 — Konglish',
      word: {
        showTopBar: true,
        showBadge: true,
        badgeText: 'KONGLISH',
        word: '핸드폰',
        pronunciation: 'haendeupon',
        meaning: '"hand phone": a mobile phone',
        showDivider: true,
        examples: [
          { id: '1', term: '아이쇼핑 (aisyoping)', meaning: '"eye shopping": window shopping' },
          { id: '2', term: '원룸 (wollum)', meaning: '"one room": a studio flat' },
        ],
      },
    },
  },
  {
    id: 'ko-minimal-seolleoda',
    label: '설레다 (Minimale)',
    language: 'ko',
    template: 'minimal',
    aspectRatio: '1:1',
    colorThemeId: 'warm-cream',
    fontFamily: 'Noto Sans KR',
    fontWeight: '700',
    patch: {
      name: '설레다 — Parola Minimale',
      minimal: {
        word: '설레다',
        pronunciation: 'seolleoda',
        meaning: '',
        verticalLayout: false,
      },
    },
  },
  {
    id: 'ko-minimal-calligraphy',
    label: '인연 (Calligrafia Pennello)',
    language: 'ko',
    template: 'minimal',
    aspectRatio: '1:1',
    colorThemeId: 'rice-paper-ink',
    fontFamily: 'Nanum Brush Script',
    fontWeight: '400',
    sealEnabled: true,
    sealText: '한',
    inkEffect: 'brush-bleed',
    paperTexture: 'hanji',
    patch: {
      name: '인연 — Calligrafia Coreana',
      minimal: {
        word: '인연',
        pronunciation: 'in-yeon',
        meaning: 'legame del destino',
        verticalLayout: true,
      },
    },
  },
  {
    id: 'ko-dialogue-today',
    label: '오늘 가능해요? (Dialogo)',
    language: 'ko',
    template: 'dialogue',
    aspectRatio: '1:1',
    colorThemeId: 'warm-cream',
    fontFamily: 'Noto Sans KR',
    fontWeight: '700',
    patch: {
      name: 'Dialogo — 오늘 가능해요?',
      dialogue: {
        showSubtext: false,
        bubbleRadius: 999,
        bubbles: [
          {
            id: 'b1',
            side: 'left',
            text: '오늘 가능해요?',
            subtext: 'oneul ganeunghaeyo?',
            style: 'outline',
          },
          {
            id: 'b2',
            side: 'right',
            text: '아쉽지만 오늘은 안 돼요.',
            subtext: 'aswipjiman oneureun an dwaeyo.',
            style: 'filled',
          },
        ],
      },
    },
  },
  {
    id: 'ko-quiz-coffee',
    label: 'Quiz Barista (Coreano)',
    language: 'ko',
    template: 'quiz',
    aspectRatio: '4:3',
    colorThemeId: 'editorial-slate',
    fontFamily: 'Noto Sans KR',
    fontWeight: '700',
    patch: {
      name: 'Quiz — Al Bar in Corea',
      quiz: {
        showTopBar: true,
        showBadge: true,
        badgeText: 'QUIZ',
        question: 'You pay for coffee and leave. To the barista you say:',
        showWatermark: true,
        highlightCorrect: false,
        options: [
          { id: 'o1', label: 'A', text: '수고하세요', isCorrect: true },
          { id: 'o2', label: 'B', text: '잘 먹겠습니다', isCorrect: false },
          { id: 'o3', label: 'C', text: '생일 축하해요', isCorrect: false },
        ],
      },
    },
  },

  // CHINESE PRESETS
  {
    id: 'zh-word-powerbank',
    label: '充电宝 (Scheda Parola)',
    language: 'zh',
    template: 'word',
    aspectRatio: '4:3',
    colorThemeId: 'editorial-slate',
    fontFamily: 'Noto Sans SC',
    fontWeight: '700',
    patch: {
      name: '充电宝 — Scheda Cinese',
      word: {
        showTopBar: true,
        showBadge: true,
        badgeText: 'HSK 4',
        word: '充电宝',
        pronunciation: 'chōngdiànbǎo',
        meaning: '充电 ricarica + 宝 tesoro: power bank portatile',
        showDivider: true,
        examples: [
          { id: '1', term: '手机 (shǒujī)', meaning: 'telefono cellulare ("macchina a mano")' },
          { id: '2', term: '电脑 (diànnǎo)', meaning: 'computer ("cervello elettrico")' },
        ],
      },
    },
  },
  {
    id: 'zh-word-chengyu',
    label: '一见钟情 (Chengyu)',
    language: 'zh',
    template: 'word',
    aspectRatio: '4:3',
    colorThemeId: 'rice-paper-ink',
    fontFamily: 'Ma Shan Zheng',
    fontWeight: '400',
    sealEnabled: true,
    sealText: '情',
    inkEffect: 'soft-ink',
    paperTexture: 'hanji',
    patch: {
      name: '一见钟情 — Chengyu Calligrafico',
      word: {
        showTopBar: true,
        showBadge: true,
        badgeText: 'CHENGYU',
        word: '一见钟情',
        pronunciation: 'yī jiàn zhōng qíng',
        meaning: 'colpo di fulmine: innamorarsi al primo sguardo',
        showDivider: true,
        examples: [
          { id: '1', term: '一见 (yī jiàn)', meaning: 'al primo sguardo, appena vedersi' },
          { id: '2', term: '钟情 (zhōng qíng)', meaning: 'provare un sentimento profondo' },
        ],
      },
    },
  },
  {
    id: 'zh-minimal-yuanfen',
    label: '缘分 (Calligrafia Pennello)',
    language: 'zh',
    template: 'minimal',
    aspectRatio: '1:1',
    colorThemeId: 'rice-paper-ink',
    fontFamily: 'Zhi Mang Xing',
    fontWeight: '400',
    sealEnabled: true,
    sealText: '缘',
    inkEffect: 'brush-bleed',
    paperTexture: 'hanji',
    patch: {
      name: '缘分 — Calligrafia Cinese',
      minimal: {
        word: '缘分',
        pronunciation: 'yuánfèn',
        meaning: 'affinità predestinata',
        verticalLayout: true,
      },
    },
  },
  {
    id: 'zh-minimal-jiayou',
    label: '加油 (Minimale Pulita)',
    language: 'zh',
    template: 'minimal',
    aspectRatio: '1:1',
    colorThemeId: 'warm-cream',
    fontFamily: 'Noto Serif SC',
    fontWeight: '700',
    patch: {
      name: '加油 — Minimale Cinese',
      minimal: {
        word: '加油',
        pronunciation: 'jiāyóu',
        meaning: '',
        verticalLayout: false,
      },
    },
  },
  {
    id: 'zh-dialogue-today',
    label: '今天有空吗？ (Dialogo)',
    language: 'zh',
    template: 'dialogue',
    aspectRatio: '1:1',
    colorThemeId: 'warm-cream',
    fontFamily: 'Noto Sans SC',
    fontWeight: '700',
    patch: {
      name: 'Dialogo — 今天有空吗？',
      dialogue: {
        showSubtext: true,
        bubbleRadius: 999,
        bubbles: [
          {
            id: 'b1',
            side: 'left',
            text: '今天有空吗？',
            subtext: 'Jīntiān yǒukòng ma? · Sei libero oggi?',
            style: 'outline',
          },
          {
            id: 'b2',
            side: 'right',
            text: '不好意思，今天不行。',
            subtext: 'Bù hǎoyìsi, jīntiān bùxíng. · Scusa, oggi non posso.',
            style: 'filled',
          },
        ],
      },
    },
  },
  {
    id: 'zh-quiz-shop',
    label: 'Quiz Negozio (Cinese)',
    language: 'zh',
    template: 'quiz',
    aspectRatio: '4:3',
    colorThemeId: 'editorial-slate',
    fontFamily: 'Noto Sans SC',
    fontWeight: '700',
    patch: {
      name: 'Quiz — In Negozio in Cina',
      quiz: {
        showTopBar: true,
        showBadge: true,
        badgeText: 'QUIZ',
        question: 'Entri in un negozio o ristorante in Cina. Il commesso ti accoglie dicendo:',
        showWatermark: true,
        highlightCorrect: false,
        options: [
          { id: 'o1', label: 'A', text: '欢迎光临', isCorrect: true },
          { id: 'o2', label: 'B', text: '慢走', isCorrect: false },
          { id: 'o3', label: 'C', text: '没关系', isCorrect: false },
        ],
      },
    },
  },
];

export function createInitialProject(): CardProject {
  const firstPreset = CONTENT_PRESETS[0];
  const theme = COLOR_THEMES.find((t) => t.id === firstPreset.colorThemeId) || COLOR_THEMES[0];

  return {
    id: 'default-project',
    name: firstPreset.patch.name || 'Nuova Scheda',
    language: 'ko',
    template: 'word',
    aspectRatio: '4:3',
    typography: {
      mainFont: 'Noto Sans KR',
      secondaryFont: 'Plus Jakarta Sans',
      mainScale: 1,
      secondaryScale: 1,
      mainWeight: '700',
      letterSpacing: 0,
      lineHeight: 1.25,
      inkEffect: 'clean',
      paperTexture: 'none',
      sealEnabled: false,
      sealText: '한',
      sealPosition: 'bottom-right',
    },
    colors: { ...theme.colors },
    word: firstPreset.patch.word!,
    minimal: CONTENT_PRESETS[2].patch.minimal!,
    dialogue: CONTENT_PRESETS[4].patch.dialogue!,
    quiz: CONTENT_PRESETS[5].patch.quiz!,
    updatedAt: Date.now(),
  };
}
