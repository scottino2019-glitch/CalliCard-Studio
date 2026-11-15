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
  const key = `${texture}-v2-${isDarkBg ? 'dark' : 'light'}`;
  const cached = paperPatternCache.get(key);
  if (cached) return cached;

  const size = 320;
  const tile = document.createElement('canvas');
  tile.width = size;
  tile.height = size;
  const tctx = tile.getContext('2d');
  if (!tctx) return null;

  // Deterministic pseudo-random generator
  let seed = texture === 'hanji' ? 1337 : 4242;
  const rand = () => {
    seed = (seed * 16807) % 2147483647;
    return (seed - 1) / 2147483646;
  };

  if (texture === 'hanji') {
    // Soft organic paper mottling clouds
    for (let c = 0; c < 26; c++) {
      const cx = rand() * size;
      const cy = rand() * size;
      const radius = 24 + rand() * 52;
      const grad = tctx.createRadialGradient(cx, cy, 0, cx, cy, radius);
      const col = isDarkBg ? '245, 236, 216' : '118, 92, 58';
      grad.addColorStop(0, `rgba(${col}, ${isDarkBg ? 0.055 : 0.07})`);
      grad.addColorStop(1, `rgba(${col}, 0)`);
      tctx.fillStyle = grad;
      tctx.fillRect(0, 0, size, size);
    }

    // Tactile 2x2 paper tooth speckles (stays crisp even when preview is scaled down)
    for (let y = 0; y < size; y += 2) {
      for (let x = 0; x < size; x += 2) {
        const n = rand();
        if (n > 0.62) {
          const alpha = ((n - 0.62) / 0.38) * (isDarkBg ? 0.08 : 0.11);
          tctx.fillStyle = isDarkBg
            ? `rgba(242, 234, 218, ${alpha.toFixed(3)})`
            : `rgba(88, 68, 42, ${alpha.toFixed(3)})`;
          tctx.fillRect(x, y, 2, 2);
        }
      }
    }

    // Authentic mulberry paper (Hanji / Xuan) fibers
    for (let f = 0; f < 95; f++) {
      const x = rand() * size;
      const y = rand() * size;
      const len = 14 + rand() * 38;
      const angle = rand() * Math.PI * 2;
      const bend = (rand() - 0.5) * 14;
      const alpha = (isDarkBg ? 0.09 : 0.11) + rand() * 0.12;
      tctx.strokeStyle = isDarkBg
        ? `rgba(245, 238, 220, ${alpha.toFixed(3)})`
        : `rgba(104, 78, 46, ${alpha.toFixed(3)})`;
      tctx.lineWidth = 1.0 + rand() * 1.1;
      tctx.lineCap = 'round';
      tctx.beginPath();
      tctx.moveTo(x, y);
      tctx.quadraticCurveTo(
        x + Math.cos(angle + 0.45) * (len * 0.5) + bend,
        y + Math.sin(angle + 0.45) * (len * 0.5) - bend,
        x + Math.cos(angle) * len,
        y + Math.sin(angle) * len
      );
      tctx.stroke();
    }
  } else {
    // Editorial archival cotton-press paper: laid horizontal ribs + fine press grain
    const ribColor = isDarkBg ? '226, 232, 240' : '30, 41, 59';
    tctx.strokeStyle = `rgba(${ribColor}, ${isDarkBg ? 0.05 : 0.055})`;
    tctx.lineWidth = 1.2;
    for (let y = 0; y < size; y += 8) {
      tctx.beginPath();
      tctx.moveTo(0, y + 0.5);
      tctx.lineTo(size, y + 0.5);
      tctx.stroke();
    }

    // Subtle vertical chain lines
    tctx.strokeStyle = `rgba(${ribColor}, ${isDarkBg ? 0.035 : 0.04})`;
    for (let x = 0; x < size; x += 64) {
      tctx.beginPath();
      tctx.moveTo(x + 0.5, 0);
      tctx.lineTo(x + 0.5, size);
      tctx.stroke();
    }

    // Fine 2x2 archival grain speckles
    for (let y = 0; y < size; y += 2) {
      for (let x = 0; x < size; x += 2) {
        const n = rand();
        if (n > 0.55) {
          const alpha = ((n - 0.55) / 0.45) * (isDarkBg ? 0.095 : 0.12);
          tctx.fillStyle = `rgba(${ribColor}, ${alpha.toFixed(3)})`;
          tctx.fillRect(x, y, 2, 2);
        }
      }
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

function clearInkShadow(ctx: CanvasRenderingContext2D) {
  ctx.shadowColor = 'transparent';
  ctx.shadowBlur = 0;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
}

function drawCalligraphicText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  effect: CardProject['typography']['inkEffect'],
  inkColor: string,
  unit: number,
  fontSizePx: number
) {
  if (effect === 'clean') {
    clearInkShadow(ctx);
    ctx.fillStyle = inkColor;
    ctx.fillText(text, x, y);
    return;
  }

  const { r, g, b } = hexToRgb(inkColor);
  ctx.save();
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  if (effect === 'soft-ink') {
    // Soft sumi ink cushion & gentle absorption into paper
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.36)`;
    ctx.shadowBlur = 11 * unit;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 2 * unit;
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.24)`;
    ctx.lineWidth = Math.max(1.5, fontSizePx * 0.028);
    ctx.strokeText(text, x, y);

    clearInkShadow(ctx);
    ctx.fillStyle = inkColor;
    ctx.fillText(text, x, y);
  } else {
    // Expressive wet-brush bleed: wide ink aura + feathered bleed edge + directional brush echo
    ctx.shadowColor = `rgba(${r}, ${g}, ${b}, 0.55)`;
    ctx.shadowBlur = 22 * unit;
    ctx.shadowOffsetX = 2.5 * unit;
    ctx.shadowOffsetY = 3.5 * unit;
    ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.42)`;
    ctx.lineWidth = Math.max(2.5, fontSizePx * 0.058);
    ctx.strokeText(text, x, y);

    clearInkShadow(ctx);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.26)`;
    ctx.fillText(text, x + 2.0 * unit, y + 1.4 * unit);

    ctx.fillStyle = inkColor;
    ctx.fillText(text, x, y);
  }

  ctx.restore();
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
    `400 64px "${project.typography.mainFont}"`,
    `700 64px "${project.typography.mainFont}"`,
    `500 32px "${project.typography.secondaryFont}"`,
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

  // 2. Paper Texture + Tactile Edge Vignette
  const { r, g, b } = hexToRgb(project.colors.background);
  const isDarkBg = (0.299 * r + 0.587 * g + 0.114 * b) / 255 < 0.45;
  const paperTile = getPaperTile(project.typography.paperTexture, isDarkBg);
  if (paperTile) {
    const pattern = ctx.createPattern(paperTile, 'repeat');
    if (pattern) {
      ctx.fillStyle = pattern;
      ctx.fillRect(0, 0, W, H);
    }
    const edgeVig = ctx.createRadialGradient(
      W / 2,
      H / 2,
      Math.min(W, H) * 0.25,
      W / 2,
      H / 2,
      Math.hypot(W, H) * 0.55
    );
    edgeVig.addColorStop(0, 'rgba(0,0,0,0)');
    edgeVig.addColorStop(
      1,
      isDarkBg ? 'rgba(255,255,255,0.04)' : 'rgba(62,45,25,0.065)'
    );
    ctx.fillStyle = edgeVig;
    ctx.fillRect(0, 0, W, H);
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
  drawCalligraphicText(
    ctx,
    wordText,
    padX,
    curY,
    typography.inkEffect,
    colors.primaryText,
    unit,
    mainSize
  );

  curY += Math.round(mainSize * 1.12);

  // Pronunciation
  if (word.pronunciation.trim()) {
    const pronSize = Math.round(50 * unit * typography.secondaryScale);
    setCanvasFont(ctx, '700', pronSize, typography.secondaryFont, 0.01);
    ctx.fillStyle = colors.accent;
    const pronLines = wrapText(ctx, word.pronunciation, maxWidth);
    for (const line of pronLines) {
      ctx.fillText(line, padX, curY);
      curY += Math.round(pronSize * typography.lineHeight);
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
      curY += Math.round(meanSize * typography.lineHeight);
    }
  }

  // Bottom Examples Section
  const validExamples = word.examples.filter((e) => e.term.trim() || e.meaning.trim());
  if (validExamples.length > 0 || word.showDivider) {
    const bottomMargin = Math.round(H * 0.05);
    const termSize = Math.round(44 * unit * typography.secondaryScale);
    const exMeanSize = Math.round(38 * unit * typography.secondaryScale);
    const itemGap = Math.round(22 * unit);
    const blockPerItem = Math.round(
      termSize * typography.lineHeight + exMeanSize * typography.lineHeight + itemGap
    );
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
        const termLines = wrapText(ctx, ex.term, maxWidth);
        for (const tl of termLines) {
          drawCalligraphicText(
            ctx,
            tl,
            padX,
            exY,
            typography.inkEffect,
            colors.primaryText,
            unit,
            termSize
          );
          exY += Math.round(termSize * typography.lineHeight);
        }
      }
      if (ex.meaning.trim()) {
        setCanvasFont(ctx, '400', exMeanSize, typography.secondaryFont, 0);
        ctx.fillStyle = colors.secondaryText;
        const lines = wrapText(ctx, ex.meaning, maxWidth);
        for (const l of lines) {
          ctx.fillText(l, padX, exY);
          exY += Math.round(exMeanSize * typography.lineHeight);
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

    // Draw right-to-left columns for authentic East Asian typography
    cols.forEach((colStr, colIdx) => {
      const colX = centerX + totalColsW / 2 - colIdx * colSpacing;
      const chars = Array.from(colStr.trim());
      chars.forEach((ch, rowIdx) => {
        drawCalligraphicText(
          ctx,
          ch,
          colX,
          startY + rowIdx * charSize * charStep,
          typography.inkEffect,
          colors.primaryText,
          unit,
          charSize
        );
      });
    });

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

  for (const l of rawLines) {
    drawCalligraphicText(
      ctx,
      l,
      centerX,
      curY,
      typography.inkEffect,
      colors.primaryText,
      unit,
      mainSize
    );
    curY += wordLineH;
  }

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
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';

    const textStartY = curY + (m.h - m.lines.length * lineH) / 2 + lineH / 2;
    m.lines.forEach((line, idx) => {
      drawCalligraphicText(
        ctx,
        line,
        x + padBubbleX,
        textStartY + idx * lineH,
        typography.inkEffect,
        textColor,
        unit,
        bubbleFontSize
      );
    });
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

  // Quiz Option Grid dimensions calculated first so question lineHeight never collides
  const opts = quiz.options;
  const bottomMargin = Math.round(H * 0.08);
  const availW = W - padX * 2;
  const isPortrait = W < H;
  const cols = isPortrait ? 1 : opts.length <= 3 ? Math.max(opts.length, 1) : 2;
  const rows = Math.max(1, Math.ceil(opts.length / cols));

  const gapX = Math.round(26 * unit);
  const gapY = Math.round(22 * unit * (typography.lineHeight / 1.25));
  const cardH = Math.round((isPortrait ? 128 : 150) * unit);
  const cardW = Math.round((availW - gapX * (cols - 1)) / cols);
  const totalGridH = opts.length > 0 ? rows * cardH + (rows - 1) * gapY : 0;

  // Question text respecting typography.lineHeight and fitting safely above options
  const qMaxW = quiz.showWatermark ? W * 0.66 : W - padX * 2;
  const availQuestionH =
    opts.length > 0
      ? Math.max(120 * unit, H - bottomMargin - totalGridH - Math.round(36 * unit) - curY)
      : H - bottomMargin - curY;

  let qSize = Math.round(92 * unit * typography.secondaryScale);
  setCanvasFont(ctx, '700', qSize, typography.secondaryFont, -0.01);
  let qLines = wrapText(ctx, quiz.question || ' ', qMaxW);
  while (
    (qLines.length > 4 || qLines.length * qSize * typography.lineHeight > availQuestionH) &&
    qSize > 38 * unit
  ) {
    qSize = Math.round(qSize * 0.92);
    setCanvasFont(ctx, '700', qSize, typography.secondaryFont, -0.01);
    qLines = wrapText(ctx, quiz.question || ' ', qMaxW);
  }

  const qLineH = Math.round(qSize * typography.lineHeight);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  let qY = curY;
  for (const line of qLines) {
    drawCalligraphicText(
      ctx,
      line,
      padX,
      qY,
      typography.inkEffect,
      colors.primaryText,
      unit,
      qSize
    );
    qY += qLineH;
  }

  if (opts.length === 0) return;

  const startGridY = Math.max(qY + Math.round(28 * unit), H - bottomMargin - totalGridH);

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

    // Option text in target CJK font (wraps cleanly if long and respects lineHeight)
    const optTextX = badgeCx + badgeR + Math.round(20 * unit);
    const optMaxW = ox + cardW - optTextX - Math.round(20 * unit);
    let optSize = Math.round(46 * unit * typography.mainScale);
    setCanvasFont(ctx, typography.mainWeight, optSize, typography.mainFont, typography.letterSpacing);
    let optLines = wrapText(ctx, opt.text || ' ', optMaxW);
    while (
      (optLines.length > 2 ||
        optLines.some((l) => ctx.measureText(l).width > optMaxW)) &&
      optSize > 24 * unit
    ) {
      optSize = Math.round(optSize * 0.9);
      setCanvasFont(ctx, typography.mainWeight, optSize, typography.mainFont, typography.letterSpacing);
      optLines = wrapText(ctx, opt.text || ' ', optMaxW);
    }

    const optTextColor = isHighlighted ? getContrastColor(colors.accent) : colors.primaryText;
    const optLineH = Math.round(optSize * Math.min(typography.lineHeight, 1.45));
    const optStartY = badgeCy - ((optLines.length - 1) * optLineH) / 2 + 1 * unit;

    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    optLines.forEach((ol, lineIdx) => {
      drawCalligraphicText(
        ctx,
        ol,
        optTextX,
        optStartY + lineIdx * optLineH,
        typography.inkEffect,
        optTextColor,
        unit,
        optSize
      );
    });

    ctx.restore();
  });
}
