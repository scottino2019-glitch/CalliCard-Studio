export type LanguageMode = 'ko' | 'zh';

export type CardTemplate = 'word' | 'minimal' | 'dialogue' | 'quiz';

export type AspectRatioId = '1:1' | '4:3' | '4:5' | '9:16' | '16:9';

export type InkEffect = 'clean' | 'soft-ink' | 'brush-bleed';

export type PaperTexture = 'none' | 'hanji' | 'editorial';

export type SealPosition = 'bottom-right' | 'bottom-left' | 'top-right';

export interface AspectRatioSpec {
  id: AspectRatioId;
  label: string;
  sublabel: string;
  width: number;
  height: number;
}

export interface WordExample {
  id: string;
  term: string;
  meaning: string;
}

export interface WordCardData {
  showTopBar: boolean;
  showBadge: boolean;
  badgeText: string;
  word: string;
  pronunciation: string;
  meaning: string;
  showDivider: boolean;
  examples: WordExample[];
}

export interface MinimalCardData {
  word: string;
  pronunciation: string;
  meaning: string;
  verticalLayout: boolean;
}

export interface DialogueBubble {
  id: string;
  side: 'left' | 'right';
  text: string;
  subtext: string;
  style: 'outline' | 'filled';
}

export interface DialogueCardData {
  bubbles: DialogueBubble[];
  showSubtext: boolean;
  bubbleRadius: number;
}

export interface QuizOption {
  id: string;
  label: string;
  text: string;
  isCorrect: boolean;
}

export interface QuizCardData {
  showTopBar: boolean;
  showBadge: boolean;
  badgeText: string;
  question: string;
  showWatermark: boolean;
  highlightCorrect: boolean;
  options: QuizOption[];
}

export interface CardTypography {
  mainFont: string;
  secondaryFont: string;
  mainScale: number;
  secondaryScale: number;
  mainWeight: '400' | '500' | '600' | '700' | '900';
  letterSpacing: number;
  lineHeight: number;
  inkEffect: InkEffect;
  paperTexture: PaperTexture;
  sealEnabled: boolean;
  sealText: string;
  sealPosition: SealPosition;
}

export interface CardColors {
  background: string;
  primaryText: string;
  accent: string;
  secondaryText: string;
  border: string;
  surface: string;
}

export interface CardProject {
  id: string;
  name: string;
  language: LanguageMode;
  template: CardTemplate;
  aspectRatio: AspectRatioId;
  typography: CardTypography;
  colors: CardColors;
  word: WordCardData;
  minimal: MinimalCardData;
  dialogue: DialogueCardData;
  quiz: QuizCardData;
  updatedAt: number;
}
