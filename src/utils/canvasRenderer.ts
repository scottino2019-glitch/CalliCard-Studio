import { ASPECT_RATIOS } from '../data/presets';
import { CardProject, PaperTexture } from '../types/card';

// Cache procedural paper texture tiles so redrawing is instant
const paperPatternCache = new Map<string, HTMLCanvasElement>();

function hexToRgb(hex: string): { r: number; g: number; b: number } {
  const clean = hex.replace('#', '').trim();
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean.padEnd(6, '0').slice(0, 6);
  const num = parseInt(full, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255,
  };
}

export function getContrastColor(hex: string): string {
  const { r, g, b } = hexToRgb(hex);
  // Relative luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? '#111827' : '#FFFFFF';
}

function getPaperTile(texture: PaperTexture, isDarkBg: boolean): HTMLCanvasElement | null {
  if (texture === 'none') return null;
  const key = `${texture}-${isDarkBg ? 'dark' : 'light'}`;
  const cached = paperPatternCache.get(key);
  if (cached) return cached;

  const size = 256;
  const tile = document.createElement('canvas');
  tile.width = size;
  tile.height = size;
  const tctx = tile.getContext('2d');
  if (!tctx) return null;

  const imgData = tctx.createImageData(size, size);
  const data = imgData.data;

  // Deterministic pseudo-random grain
  let seed = texture === 'hanji' ? 1337 : 4242;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  for (let i = 0; i < data.length; i += 4) {
    const n = rand();
    if (texture === 'editorial') {
      const val = isDarkBg ? 255 : 0;
      data[i] = val;
      data[i + 1] = val;
      data[i + 2] = val;
      data[i + 3] = n > 0.5 ? Math.floor((n - 0.5) * 18) : 0;
    } else {
      // Hanji subtle warm fiber tone
      const val = isDarkBg ? 235 : 95;
      data[i] = val;
      data[i + 1] = isDarkBg ? 230 : 82;
      data[i + 2] = isDarkBg ? 220 : 65;
      data[i + 3] = n > 0.45 ? Math.floor((n - 0.45) * 20) : 0;
    }
  }
  tctx.putImageData(imgData, 0, 0);

  if (texture === 'hanji') {
    // Subtle organic mulberry paper fibers
    tctx.strokeStyle = isDarkBg ? 'rgba(255,255,255,0.035)' : 'rgba(90,72,50,0.045)';
    tctx.lineWidth = 0.8;
    for (let f = 0; f < 42; f++) {
      const x = rand() * size;
      const y = rand() * size;
      const len = 8 + rand() * 22;
      const angle = rand() * Math.PI * 2;
      tctx.beginPath();
      tctx.moveTo(x, y);
      tctx.quadraticCurveTo(
        x + Math.cos(angle + 0.4) * (len * 0.5),
        y + Math.sin(angle + 0.4) * (len * 0.5),
        x + Math.cos(angle) * len,
        y + Math.sin(angle) * len
      );
      tctx.stroke();
    }
  }

  paperPatternCache.set(key, tile);
  return tile;
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) {
  const radius = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function setCanvasFont(
  ctx: CanvasRenderingContext2D,
  weight: string,
  sizePx: number,
  family: string,
  letterSpacingEm = 0
) {
  ctx.font = `${weight} ${sizePx}px "${family}", "Noto Sans KR", "Noto Sans SC", sans-serif`;
  const ctxAny = ctx as CanvasRenderingContext2D & { letterSpacing?: string };
  if ('letterSpacing' in ctxAny) {
    ctxAny.letterSpacing = `${(letterSpacingEm * sizePx).toFixed(2)}px`;
  }
}

function applyInkShadow(
  ctx: CanvasRenderingContext2D,
  effect: CardProject['typography']['inkEffect'],
  inkColor: string,
  unitScale: number
) {
  if (effect === 'clean') {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
    return;
  }
  const { r, g, b } = hexToRgb(inkColor);
  if (effect === 'soft-ink') {
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.16)`;
    ctx.shadowBlur = 4 * unitScale;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2 * unitScale;
  } else {
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.28)`;
    ctx.shadowBlur = 11 * unitScale;
    ctx.shadowOffsetX = 1.5 * unitScale;
    ctx.shadowOffsetY = 3 * unitScale;
  }
}

function clearInkShadow(ctx: CanvasRenderingContext2D) {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

// Wraps both Latin/Korean space-separated words AND continuous Chinese/CJK strings cleanly
function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const paragraphs = text.split('\n');
  const lines: string[] = [];

  for (const para of paragraphs) {
    if (!para.trim()) {
      lines.push('');
      continue;
    }

    // Tokenize keeping spaces attached or breaking CJK runs character-by-character when needed
    const tokens: string[] = [];
    let currentWord = '';
    for (const ch of Array.from(para)) {
      const isCJK = /[\u3040-\u30ff\u3400-\u4dbf\u4e00-\u9fff\uac00-\ud7af]/.test(ch);
      if (ch === ' ') {
        if (currentWord) {
          tokens.push(currentWord);
          currentWord = '';
        }
        tokens.push(' ');
      } else if (isCJK) {
        if (currentWord) {
          tokens.push(currentWord);
          currentWord = '';
        }
        tokens.push(ch);
      } else {
        currentWord += ch;
      }
    }
    if (currentWord) tokens.push(currentWord);

    let line = '';
    for (const token of tokens) {
      if (token === ' ' && line === '') continue;
      const testLine = line + token;
      if (ctx.measureText(testLine).width > maxWidth && line.trim() !== '') {
        lines.push(line.trimEnd());
        line = token === ' ' ? '' : token;
      } else {
        line = testLine;
      }
    }
    if (line.trim() !== '') {
      lines.push(line.trimEnd());
    }
  }

  return lines.length > 0 ? lines : [''];
}

function drawChopSeal(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  project: CardProject,
  unit: number
) {
  if (!project.typography.sealEnabled) return;
  const sealChars = Array.from((project.typography.sealText || '印').trim()).slice(0, 2);
  if (sealChars.length === 0) return;

  const size = Math.round(62 * unit);
  const marginX = Math.round(W * 0.065);
  const marginY = Math.round(H * 0.065);

  let cx = W - marginX - size / 2;
  let cy = H - marginY - size / 2;
  if (project.typography.sealPosition === 'bottom-left') {
    cx = marginX + size / 2;
  } else if (project.typography.sealPosition === 'top-right') {
    cy = marginY + size / 2 + (project.template === 'word' || project.template === 'quiz' ? 14 * unit : 0);
  }

  ctx.save();
  ctx.translate(cx, cy);
  ctx.rotate(-0.035);

  const sealColor = '#B91C1C';
  ctx.fillStyle = sealColor;
  drawRoundedRect(ctx, -size / 2, -size / 2, size, size, 8 * unit);
  ctx.fill();

  // Inner carved border
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
  ctx.lineWidth = 1.5 * unit;
  drawRoundedRect(ctx, -size / 2 + 4 * unit, -size / 2 + 4 * unit, size - 8 * unit, size - 8 * unit, 5 * unit);
  ctx.stroke();

  ctx.fillStyle = '#FFFDF9';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (sealChars.length === 1) {
    setCanvasFont(ctx, '700', Math.round(size * 0.56), 'Noto Serif SC', 0);
    ctx.fillText(sealChars[0], 0, 2 * unit);
  } else {
    setCanvasFont(ctx, '700', Math.round(size * 0.36), 'Noto Serif SC', 0);
    ctx.fillText(sealChars[0], 0, -size * 0.19);
    ctx.fillText(sealChars[1], 0, size * 0.21);
  }

  ctx.restore();
}

function drawBadgePill(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  text: string,
  accentColor: string,
  secondaryFont: string,
  unit: number
) {
  const label = text.trim().toUpperCase();
  if (!label) return 0;

  const fontSize = Math.round(28 * unit);
  setCanvasFont(ctx, '700', fontSize, secondaryFont, 0.06);
  const metrics = ctx.measureText(label);
  const padX = Math.round(32 * unit);
  const pillW = Math.round(metrics.width + padX * 2);
  const pillH = Math.round(58 * unit);

  ctx.fillStyle = accentColor;
  drawRoundedRect(ctx, x, y, pillW, pillH, pillH / 2);
  ctx.fill();

  ctx.fillStyle = getContrastColor(accentColor);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x + pillW / 2, y + pillH / 2 + 1 * unit);

  return pillH;
}

export async function ensureProjectFontsLoaded(project: CardProject): Promise<void> {
  if (typeof document === 'undefined' || !('fonts' in document)) return;

  const texts: string[] = [];
  if (project.template === 'word') {
    texts.push(project.word.word, project.word.pronunciation, project.word.meaning);
    project.word.examples.forEach((ex) => texts.push(ex.term, ex.meaning));
  } else if (project.template === 'minimal') {
    texts.push(project.minimal.word, project.minimal.pronunciation, project.minimal.meaning);
  } else if (project.template === 'dialogue') {
    project.dialogue.bubbles.forEach((b) => texts.push(b.text, b.subtext));
  } else {
    texts.push(project.quiz.question);
    project.quiz.options.forEach((o) => texts.push(o.text));
  }
  if (project.typography.sealEnabled) {
    texts.push(project.typography.sealText);
  }

  const combinedSample = Array.from(new Set(texts.join(''))).join('') || '가나다漢字ABC';
  const fontsToLoad = [
    `${project.typography.mainWeight} 64px "${project.typography.mainFont}"`,
    `700 64px "${project.typography.mainFont}"`,
    `400 32px "${project.typography.secondaryFont}"`,
    `700 32px "${project.typography.secondaryFont}"`,
  ];

  await Promise.allSettled(
    fontsToLoad.map((spec) => document.fonts.load(spec, combinedSample))
  );
  await document.fonts.ready;
}

export function renderCardToCanvas(
  canvas: HTMLCanvasElement,
  project: CardProject,
  scale = 1
): void {
  const spec = ASPECT_RATIOS[project.aspectRatio];
  const W = spec.width;
  const H = spec.height;

  canvas.width = Math.round(W * scale);
  canvas.height = Math.round(H * scale);

  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  ctx.save();
  ctx.scale(scale, scale);

  // Reference unit relative to 1080px short edge
  const shortEdge = Math.min(W, H);
  const unit = shortEdge / 1080;

  // 1. Card Background
  ctx.fillStyle = project.colors.background;
  ctx.fillRect(0, 0, W, H);

  // 2. Subtle Paper Texture
  const { r, g, b } = hexToRgb(project.colors.background);
  const isDarkBg = (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.45;
  const paperTile = getPaperTile(project.typography.paperTexture, isDarkBg);
  if (paperTile) {
    const pattern = ctx.createPattern(paperTile, 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, W, H);
    }
  }

  // 3. Render Template
  if (project.template === 'word') {
    renderWordTemplate(ctx, W, H, unit, project);
  } else if (project.template === 'minimal') {
    renderMinimalTemplate(ctx, W, H, unit, project);
  } else if (project.template === 'dialogue') {
    renderDialogueTemplate(ctx, W, H, unit, project);
  } else {
    renderQuizTemplate(ctx, W, H, unit, project);
  }

  // 4. Optional Red Chop Seal
  drawChopSeal(ctx, W, H, project, unit);

  ctx.restore();
}

function renderWordTemplate(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  unit: number,
  project: CardProject
) {
  const { word, typography, colors } = project;
  const padX = Math.round(W * 0.065);
  const maxWidth = W - padX * 2;
  let curY = 0;

  // Top accent strip
  if (word.showTopBar) {
    const barH = Math.round(18 * unit);
    ctx.fillStyle = colors.accent;
    ctx.fillRect(0, 0, W, barH);
    curY = barH + Math.round(H * 0.05);
  } else {
    curY = Math.round(H * 0.07);
  }

  // Badge pill
  if (word.showBadge && word.badgeText.trim()) {
    const pillH = drawBadgePill(
      ctx,
      padX,
      curY,
      word.badgeText,
      colors.accent,
      typography.secondaryFont,
      unit
    );
    curY += pillH + Math.round(H * 0.048);
  } else {
    curY += Math.round(H * 0.02);
  }

  // Main target word (auto-fit if long)
  let mainSize = Math.round(176 * unit * typography.mainScale);
  setCanvasFont(ctx, typography.mainWeight, mainSize, typography.mainFont, typography.letterSpacing);
  const wordText = word.word || ' ';
  while (ctx.measureText(wordText).width > maxWidth && mainSize > 56 * unit) {
    mainSize = Math.round(mainSize * 0.9);
    setCanvasFont(ctx, typography.mainWeight, mainSize, typography.mainFont, typography.letterSpacing);
  }

  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillStyle = colors.primaryText;
  applyInkShadow(ctx, typography.inkEffect, colors.primaryText, unit);
  ctx.fillText(wordText, padX, curY);
  clearInkShadow(ctx);

  curY += Math.round(mainSize * 1.12);

  // Pronunciation
  if (word.pronunciation.trim()) {
    const pronSize = Math.round(50 * unit * typography.secondaryScale);
    setCanvasFont(ctx, '700', pronSize, typography.secondaryFont, 0.01);
    ctx.fillStyle = colors.accent;
    const pronLines = wrapText(ctx, word.pronunciation, maxWidth);
    for (const line of pronLines) {
      ctx.fillText(line, padX, curY);
      curY += Math.round(pronSize * 1.24);
    }
    curY += Math.round(10 * unit);
  }

  // Meaning / breakdown
  if (word.meaning.trim()) {
    const meanSize = Math.round(44 * unit * typography.secondaryScale);
    setCanvasFont(ctx, '500', meanSize, typography.secondaryFont, 0);
    ctx.fillStyle = colors.secondaryText;
    const meanLines = wrapText(ctx, word.meaning, maxWidth);
    for (const line of meanLines) {
      ctx.fillText(line, padX, curY);
      curY += Math.round(meanSize * 1.3);
    }
  }

  // Bottom Examples Section
  const validExamples = word.examples.filter((e) => e.term.trim() || e.meaning.trim());
  if (validExamples.length > 0 || word.showDivider) {
    const bottomMargin = Math.round(H * 0.05);
    const termSize = Math.round(44 * unit * typography.secondaryScale);
    const exMeanSize = Math.round(38 * unit * typography.secondaryScale);
    const itemGap = Math.round(22 * unit);
    const blockPerItem = Math.round(termSize * 1.22 + exMeanSize * 1.25 + itemGap);
    const totalExamplesH = validExamples.length * blockPerItem;

    const minDividerY = curY + Math.round(28 * unit);
    const idealDividerY = H - bottomMargin - totalExamplesH - Math.round(28 * unit);
    const dividerY = Math.max(minDividerY, idealDividerY);

    if (word.showDivider) {
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = Math.max(2, Math.round(3.5 * unit));
      ctx.beginPath();
      ctx.moveTo(padX, dividerY);
      ctx.lineTo(W - padX, dividerY);
      ctx.stroke();
    }

    let exY = dividerY + Math.round(30 * unit);
    for (const ex of validExamples) {
      if (ex.term.trim()) {
        setCanvasFont(ctx, '700', termSize, typography.mainFont, 0);
        ctx.fillStyle = colors.primaryText;
        const termLines = wrapText(ctx, ex.term, maxWidth);
        for (const tl of termLines) {
          ctx.fillText(tl, padX, exY);
          exY += Math.round(termSize * 1.22);
        }
      }
      if (ex.meaning.trim()) {
        setCanvasFont(ctx, '400', exMeanSize, typography.secondaryFont, 0);
        ctx.fillStyle = colors.secondaryText;
        const lines = wrapText(ctx, ex.meaning, maxWidth);
        for (const l of lines) {
          ctx.fillText(l, padX, exY);
          exY += Math.round(exMeanSize * 1.24);
        }
      }
      exY += Math.round(itemGap * 0.8);
    }
  }
}

function renderMinimalTemplate(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  unit: number,
  project: CardProject
) {
  const { minimal, typography, colors } = project;
  const maxWidth = W * 0.84;
  const centerX = W / 2;

  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  if (minimal.verticalLayout) {
    // Traditional vertical East Asian calligraphy column(s)
    const columns = minimal.word.split('\n').filter((c) => c.trim().length > 0);
    const cols = columns.length > 0 ? columns : [' '];
    const maxCharsInCol = Math.max(...cols.map((c) => Array.from(c.trim()).length), 1);

    const availH = H * 0.64;
    let charSize = Math.round(156 * unit * typography.mainScale);
    const charStep = 1.12;
    if (maxCharsInCol * charSize * charStep > availH) {
      charSize = Math.round(availH / (maxCharsInCol * charStep));
    }

    setCanvasFont(ctx, typography.mainWeight, charSize, typography.mainFont, 0);

    const colSpacing = charSize * 1.25;
    const totalColsW = (cols.length - 1) * colSpacing;
    const totalWordH = maxCharsInCol * charSize * charStep;

    const pronSize = Math.round(44 * unit * typography.secondaryScale);
    const meanSize = Math.round(36 * unit * typography.secondaryScale);
    const hasPron = Boolean(minimal.pronunciation.trim());
    const hasMean = Boolean(minimal.meaning.trim());
    const subH = (hasPron ? pronSize * 1.4 + 28 * unit : 0) + (hasMean ? meanSize * 1.4 : 0);

    const startY = (H - (totalWordH + subH)) / 2 + (charSize * charStep) / 2;

    ctx.fillStyle = colors.primaryText;
    applyInkShadow(ctx, typography.inkEffect, colors.primaryText, unit);

    // Draw right-to-left columns for authentic East Asian typography
    cols.forEach((colStr, colIdx) => {
      const colX = centerX + totalColsW / 2 - colIdx * colSpacing;
      const chars = Array.from(colStr.trim());
      chars.forEach((ch, rowIdx) => {
        ctx.fillText(ch, colX, startY + rowIdx * charSize * charStep);
      });
    });
    clearInkShadow(ctx);

    let subY = startY + (maxCharsInCol - 0.5) * charSize * charStep + Math.round(42 * unit);
    if (hasPron) {
      setCanvasFont(ctx, '600', pronSize, typography.secondaryFont, 0.02);
      ctx.fillStyle = colors.accent;
      ctx.fillText(minimal.pronunciation.trim(), centerX, subY);
      subY += Math.round(pronSize * 1.35);
    }
    if (hasMean) {
      setCanvasFont(ctx, '500', meanSize, typography.secondaryFont, 0);
      ctx.fillStyle = colors.secondaryText;
      ctx.fillText(minimal.meaning.trim(), centerX, subY);
    }
    return;
  }

  // Horizontal Centered Focus Card (matches '설레다' reference)
  let mainSize = Math.round(210 * unit * typography.mainScale);
  setCanvasFont(ctx, typography.mainWeight, mainSize, typography.mainFont, typography.letterSpacing);
  const rawLines = minimal.word.split('\n');
  const widest = Math.max(...rawLines.map((l) => ctx.measureText(l || ' ').width));
  if (widest > maxWidth) {
    mainSize = Math.round(mainSize * (maxWidth / widest));
    setCanvasFont(ctx, typography.mainWeight, mainSize, typography.mainFont, typography.letterSpacing);
  }

  const wordLineH = Math.round(mainSize * typography.lineHeight);
  const wordBlockH = rawLines.length * wordLineH;

  const hasPron = Boolean(minimal.pronunciation.trim());
  const hasMean = Boolean(minimal.meaning.trim());
  const pronSize = Math.round(48 * unit * typography.secondaryScale);
  const meanSize = Math.round(38 * unit * typography.secondaryScale);

  const gapWordPron = hasPron ? Math.round(36 * unit) : 0;
  const pronBlockH = hasPron ? pronSize * 1.25 : 0;
  const gapPronMean = hasMean ? Math.round(20 * unit) : 0;
  const meanBlockH = hasMean ? meanSize * 1.3 : 0;

  const totalH = wordBlockH + gapWordPron + pronBlockH + gapPronMean + meanBlockH;
  let curY = (H - totalH) / 2 + wordLineH / 2;

  ctx.fillStyle = colors.primaryText;
  applyInkShadow(ctx, typography.inkEffect, colors.primaryText, unit);
  for (const l of rawLines) {
    ctx.fillText(l, centerX, curY);
    curY += wordLineH;
  }
  clearInkShadow(ctx);

  if (hasPron) {
    curY = curY - wordLineH / 2 + gapWordPron + pronBlockH / 2;
    setCanvasFont(ctx, '600', pronSize, typography.secondaryFont, 0.01);
    ctx.fillStyle = colors.accent;
    ctx.fillText(minimal.pronunciation.trim(), centerX, curY);
  }

  if (hasMean) {
    curY += (hasPron ? pronBlockH / 2 : -wordLineH / 2) + gapPronMean + meanBlockH / 2;
    setCanvasFont(ctx, '500', meanSize, typography.secondaryFont, 0);
    ctx.fillStyle = colors.secondaryText;
    const meanLines = wrapText(ctx, minimal.meaning.trim(), maxWidth);
    for (const ml of meanLines) {
      ctx.fillText(ml, centerX, curY);
      curY += Math.round(meanSize * 1.3);
    }
  }
}

function renderDialogueTemplate(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  unit: number,
  project: CardProject
) {
  const { dialogue, typography, colors } = project;
  const bubbles = dialogue.bubbles;
  if (bubbles.length === 0) return;

  const padX = Math.round(W * 0.078);
  const maxBubbleW = W * 0.78;
  const bubbleFontSize = Math.round(
    (bubbles.length > 3 ? 42 : 52) * unit * typography.mainScale
  );
  const subFontSize = Math.round(31 * unit * typography.secondaryScale);
  const padBubbleX = Math.round(48 * unit);
  const padBubbleY = Math.round(34 * unit);
  const lineH = Math.round(bubbleFontSize * typography.lineHeight);
  const bubbleGap = Math.round((bubbles.length > 3 ? 44 : 84) * unit);

  interface MeasuredBubble {
    bubble: (typeof bubbles)[number];
    lines: string[];
    subLines: string[];
    w: number;
    h: number;
    subH: number;
  }

  const measured: MeasuredBubble[] = bubbles.map((b) => {
    setCanvasFont(ctx, typography.mainWeight, bubbleFontSize, typography.mainFont, typography.letterSpacing);
    const lines = wrapText(ctx, b.text || ' ', maxBubbleW - padBubbleX * 2);
    const widest = Math.max(...lines.map((l) => ctx.measureText(l).width), 60 * unit);
    const w = Math.min(maxBubbleW, Math.round(widest + padBubbleX * 2));
    const h = Math.round(lines.length * lineH + padBubbleY * 2);

    let subLines: string[] = [];
    let subH = 0;
    if (dialogue.showSubtext && b.subtext.trim()) {
      setCanvasFont(ctx, '500', subFontSize, typography.secondaryFont, 0);
      subLines = wrapText(ctx, b.subtext.trim(), maxBubbleW);
      subH = Math.round(subLines.length * (subFontSize * 1.3) + 12 * unit);
    }

    return { bubble: b, lines, subLines, w, h, subH };
  });

  const totalStackH =
    measured.reduce((acc, m) => acc + m.h + m.subH, 0) +
    Math.max(0, measured.length - 1) * bubbleGap;

  let curY = Math.max(Math.round(H * 0.08), (H - totalStackH) / 2);

  for (const m of measured) {
    const isLeft = m.bubble.side === 'left';
    const x = isLeft ? padX : W - padX - m.w;
    const radius = Math.min(dialogue.bubbleRadius * unit, m.h / 2);

    ctx.save();
    if (m.bubble.style === 'filled') {
      ctx.fillStyle = colors.accent;
      drawRoundedRect(ctx, x, curY, m.w, m.h, radius);
      ctx.fill();
    } else {
      ctx.fillStyle = colors.surface;
      drawRoundedRect(ctx, x, curY, m.w, m.h, radius);
      ctx.fill();
      ctx.strokeStyle = colors.border;
      ctx.lineWidth = Math.max(1.5, Math.round(2 * unit));
      ctx.stroke();
    }

    // Text inside bubble
    const textColor =
      m.bubble.style === 'filled' ? getContrastColor(colors.accent) : colors.primaryText;
    setCanvasFont(ctx, typography.mainWeight, bubbleFontSize, typography.mainFont, typography.letterSpacing);
    ctx.fillStyle = textColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    applyInkShadow(ctx, typography.inkEffect, textColor, unit);

    const textStartY = curY + (m.h - m.lines.length * lineH) / 2 + lineH / 2;
    m.lines.forEach((line, idx) => {
      ctx.fillText(line, x + padBubbleX, textStartY + idx * lineH);
    });
    clearInkShadow(ctx);
    ctx.restore();

    // Optional romanization / pinyin / translation subtext below bubble
    if (m.subLines.length > 0) {
      setCanvasFont(ctx, '500', subFontSize, typography.secondaryFont, 0);
      ctx.fillStyle = colors.secondaryText;
      ctx.textAlign = isLeft ? 'left' : 'right';
      ctx.textBaseline = 'top';
      const subX = isLeft ? x + 18 * unit : x + m.w - 18 * unit;
      let sy = curY + m.h + 12 * unit;
      for (const sl of m.subLines) {
        ctx.fillText(sl, subX, sy);
        sy += Math.round(subFontSize * 1.3);
      }
    }

    curY += m.h + m.subH + bubbleGap;
  }
}

function renderQuizTemplate(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  unit: number,
  project: CardProject
) {
  const { quiz, typography, colors } = project;
  const padX = Math.round(W * 0.068);
  let curY = 0;

  if (quiz.showTopBar) {
    const barH = Math.round(16 * unit);
    ctx.fillStyle = colors.accent;
    ctx.fillRect(0, 0, W, barH);
    curY = barH + Math.round(H * 0.055);
  } else {
    curY = Math.round(H * 0.075);
  }

  if (quiz.showBadge && quiz.badgeText.trim()) {
    const pillH = drawBadgePill(
      ctx,
      padX,
      curY,
      quiz.badgeText,
      colors.accent,
      typography.secondaryFont,
      unit
    );
    curY += pillH + Math.round(H * 0.09);
  } else {
    curY += Math.round(H * 0.04);
  }

  // Optional decorative '?' motif on right side of card (matches user Quiz reference!)
  if (quiz.showWatermark) {
    ctx.save();
    const { r, g, b } = hexToRgb(colors.border);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.11)`;
    setCanvasFont(ctx, '800', Math.round(520 * unit), typography.secondaryFont, 0);
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText('?', W - padX * 0.65, H * 0.48);
    ctx.restore();
  }

  // Question text
  const qMaxW = quiz.showWatermark ? W * 0.66 : W - padX * 2;
  let qSize = Math.round(92 * unit * typography.secondaryScale);
  setCanvasFont(ctx, '700', qSize, typography.secondaryFont, -0.01);
  let qLines = wrapText(ctx, quiz.question || ' ', qMaxW);
  while (qLines.length > 4 && qSize > 44 * unit) {
    qSize = Math.round(qSize * 0.9);
    setCanvasFont(ctx, '700', qSize, typography.secondaryFont, -0.01);
    qLines = wrapText(ctx, quiz.question || ' ', qMaxW);
  }

  ctx.fillStyle = colors.primaryText;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  let qY = curY;
  for (const line of qLines) {
    ctx.fillText(line, padX, qY);
    qY += Math.round(qSize * 1.18);
  }

  // Quiz Option Cards Row / Grid
  const opts = quiz.options;
  if (opts.length === 0) return;

  const bottomMargin = Math.round(H * 0.08);
  const availW = W - padX * 2;
  const isPortrait = W < H;
  const cols = isPortrait ? 1 : opts.length <= 3 ? opts.length : 2;
  const rows = Math.ceil(opts.length / cols);

  const gapX = Math.round(26 * unit);
  const gapY = Math.round(22 * unit);
  const cardH = Math.round((isPortrait ? 128 : 150) * unit);
  const cardW = Math.round((availW - gapX * (cols - 1)) / cols);
  const totalGridH = rows * cardH + (rows - 1) * gapY;
  const startGridY = Math.max(qY + Math.round(38 * unit), H - bottomMargin - totalGridH);

  opts.forEach((opt, idx) => {
    const colIdx = idx % cols;
    const rowIdx = Math.floor(idx / cols);
    const ox = padX + colIdx * (cardW + gapX);
    const oy = startGridY + rowIdx * (cardH + gapY);

    const isHighlighted = quiz.highlightCorrect && opt.isCorrect;

    ctx.save();
    ctx.fillStyle = isHighlighted ? colors.accent : colors.surface;
    drawRoundedRect(ctx, ox, oy, cardW, cardH, Math.round(28 * unit));
    ctx.fill();

    ctx.strokeStyle = isHighlighted ? colors.accent : colors.border;
    ctx.lineWidth = Math.max(2, Math.round(3.5 * unit));
    ctx.stroke();

    // Circular badge A / B / C
    const badgeR = Math.round(30 * unit);
    const badgeCx = ox + Math.round(28 * unit) + badgeR;
    const badgeCy = oy + cardH / 2;

    ctx.fillStyle = isHighlighted ? '#FFFFFF' : colors.border;
    ctx.beginPath();
    ctx.arc(badgeCx, badgeCy, badgeR, 0, Math.PI * 2);
    ctx.fill();

    setCanvasFont(ctx, '700', Math.round(30 * unit), typography.secondaryFont, 0);
    ctx.fillStyle = isHighlighted ? colors.accent : '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(opt.label, badgeCx, badgeCy + 1 * unit);

    // Option text in target CJK font
    const optTextX = badgeCx + badgeR + Math.round(20 * unit);
    const optMaxW = ox + cardW - optTextX - Math.round(20 * unit);
    let optSize = Math.round(46 * unit * typography.mainScale);
    setCanvasFont(ctx, typography.mainWeight, optSize, typography.mainFont, typography.letterSpacing);
    while (ctx.measureText(opt.text || ' ').width > optMaxW && optSize > 24 * unit) {
      optSize = Math.round(optSize * 0.9);
      setCanvasFont(ctx, typography.mainWeight, optSize, typography.mainFont, typography.letterSpacing);
    }

    const optTextColor = isHighlighted ? getContrastColor(colors.accent) : colors.primaryText;
    ctx.fillStyle = optTextColor;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    applyInkShadow(ctx, typography.inkEffect, optTextColor, unit);
    ctx.fillText(opt.text, optTextX, badgeCy + 1 * unit);
    clearInkShadow(ctx);

    ctx.restore();
  });
}
