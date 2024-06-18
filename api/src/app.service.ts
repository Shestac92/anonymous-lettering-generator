import { BadRequestException, Injectable } from '@nestjs/common';
import { readdir } from 'fs/promises';
import { resolve, join, extname } from 'path';
import { Image, createCanvas, loadImage } from 'canvas';
import { Prompt } from './prompt.interface';
import type { CanvasRenderingContext2D } from 'canvas';
import { ClsService } from 'nestjs-cls';

const SUPPORTED_EXTENSION = '.png';
const MARGIN_PX = 10;
const CHAR_WIDTH_PX = 20;
const CHAR_HEIGHT_PX = 30;
const MAX_LINES = 40;
const MAX_CHARS_IN_LINE = 20;
const MAX_LINE_SPACING_PX = 100;
const MAX_LETTER_SPACING_PX = 40;
const MAX_X_OFFSET_PX = 25;
const MAX_Y_OFFSET_PX = 15;
const MAX_SIZE_DEVIATION_PX = 25;
const MAX_CHAR_ROTATION_PX = 50;
const lowProfileCharCodes = [44, 46, 95];
const highProfileCharCodes = [39, 34, 94, 96];
const smallPunctuationMark = [...lowProfileCharCodes, ...highProfileCharCodes];

@Injectable()
export class AppService {
  private readonly assetsPath = resolve(__dirname, '..', 'assets');

  constructor(private readonly cls: ClsService) {}

  public async handlePrompt(body: Prompt): Promise<any> {
    performance.mark('A');

    this.sanitizeParams(body);
    const prompt = this.sanitizePrompt(body.prompt);
    const lines = this.promptToLines(prompt);

    const ctx = this.instantiateCanvas(lines, body.transparent);
    await this.drawLines(lines, ctx);
    const base64Image = ctx.canvas.toBuffer('image/png').toString('base64');

    const benchmark = performance.measure('A-B', 'A');
    console.log(
      `Image was generated! Took time: ${benchmark.duration} ms. Image size: ${ctx.canvas.width}x${ctx.canvas.height}`,
    );
    return base64Image;
  }

  private getCanvasWidth(lines: string[], letterSpacing: number): number {
    const widthInChars = lines.length > 1 ? MAX_CHARS_IN_LINE : lines[0].length;

    return (
      widthInChars * CHAR_WIDTH_PX +
      2 * MARGIN_PX +
      (widthInChars - 1) * letterSpacing
    );
  }

  private getCanvasHeight(lines: string[], lineSpacing: number): number {
    return (
      lines.length * CHAR_HEIGHT_PX +
      (lines.length - 1) * lineSpacing +
      2 * MARGIN_PX
    );
  }

  private promptToLines(prompt: string): string[] {
    const lines: string[] = [];
    const words = prompt.split(/\n|\s/);

    let word = words[0];
    let currentLine = this.wrapWord(word, lines);

    for (let i = 1; i < words.length; i++) {
      word = words[i];

      if (word === '') continue;

      const width = currentLine.length + 1 + word.length;

      if (width < MAX_CHARS_IN_LINE) {
        currentLine = `${currentLine}${' '}${word}`;
        continue;
      }

      lines.push(currentLine);
      currentLine = this.wrapWord(word, lines);
    }

    lines.push(currentLine);

    if (lines.length > MAX_LINES) {
      throw new BadRequestException(`Too long text`);
    }

    return lines;
  }

  /** Wraps the word into multiple lines until there are enough space to place the next word on the last line. */
  private wrapWord(word: string, lines: string[]): string {
    for (let i = 0; i < word.length; i += MAX_CHARS_IN_LINE) {
      const subLine = word.slice(i, i + MAX_CHARS_IN_LINE);
      const tail = word.slice(i + MAX_CHARS_IN_LINE);

      if (subLine.length <= MAX_CHARS_IN_LINE && tail.length === 0) {
        return subLine;
      }

      lines.push(subLine);
    }
  }

  private sanitizePrompt(prompt: string): string {
    return prompt.toLowerCase().trim();
  }

  private async drawLines(
    lines: string[],
    ctx: CanvasRenderingContext2D,
  ): Promise<void> {
    let cursorX = MARGIN_PX;
    let cursorY = MARGIN_PX;

    for (const line of lines) {
      const charCodes = line.split('').map((char) => char.charCodeAt(0));
      const charImgs = await this.getCharImages(charCodes);

      for (let i = 0; i < charImgs.length; i++) {
        const img = charImgs[i];

        if (!img) {
          continue;
        }

        const charCode = charCodes[i];
        this.drawChar(ctx, img, charCode, cursorX, cursorY);
        cursorX += CHAR_WIDTH_PX + this.cls.get('letterSpacing');
      }
      cursorY += CHAR_HEIGHT_PX + this.cls.get('lineSpacing');
      cursorX = MARGIN_PX;
    }
  }

  private instantiateCanvas(
    lines: string[],
    transparent: boolean,
  ): CanvasRenderingContext2D {
    const canvasWidth = this.getCanvasWidth(
      lines,
      this.cls.get('letterSpacing'),
    );
    const canvasHeight = this.getCanvasHeight(
      lines,
      this.cls.get('lineSpacing'),
    );

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    if (!transparent) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.shadowBlur = 2;
    ctx.shadowColor = 'grey';

    return ctx;
  }

  private drawChar(
    ctx: CanvasRenderingContext2D,
    img: Image,
    charCode: number,
    cursorX: number,
    cursorY: number,
  ): void {
    const isSmallPunctuationMark = smallPunctuationMark.includes(charCode);
    const isLowProfileMark = lowProfileCharCodes.includes(charCode);

    const x = cursorX + this.randomOffset(this.cls.get('maxXOffset'));
    let y = cursorY + this.randomOffset(this.cls.get('maxYOffset'));

    const cx = x + CHAR_WIDTH_PX / 2;
    const cy = y + CHAR_HEIGHT_PX / 2;
    const rotation = this.randomRotation(this.cls.get('maxRotation'));

    let charWidth =
      CHAR_WIDTH_PX + this.randomOffset(this.cls.get('maxSizeDeviation'));
    let charHeight =
      CHAR_HEIGHT_PX + this.randomOffset(this.cls.get('maxSizeDeviation'));

    if (isSmallPunctuationMark) {
      charWidth *= 0.5;
      charHeight *= 0.5;
    }

    if (isLowProfileMark) {
      y += charHeight;
    }

    ctx.translate(cx, cy);
    ctx.rotate(rotation);
    ctx.translate(-cx, -cy);

    ctx.drawImage(img, x, y, charWidth, charHeight);

    // revert rotation to default initial position
    ctx.translate(cx, cy);
    ctx.rotate(-rotation);
    ctx.translate(-cx, -cy);
  }

  private imageFilesFilter(fileNames: string[]): string[] {
    return fileNames.filter(
      (fileName) => extname(fileName).toLowerCase() === SUPPORTED_EXTENSION,
    );
  }

  private noImgError(charCode: number): never {
    throw new BadRequestException(
      `No images for '${String.fromCharCode(charCode)}' with char code '${charCode}' were found`,
    );
  }

  private async getCharImages(
    charCodes: number[],
  ): Promise<(Image | undefined)[]> {
    const promisedImageFilePaths = charCodes.map(async (charCode) => {
      // space check
      if (charCode === 32) {
        return;
      }

      const charDirPath = join(this.assetsPath, `${charCode}`);

      const charFiles = await readdir(charDirPath)
        .then(this.imageFilesFilter)
        .catch(() => this.noImgError(charCode));

      if (!charFiles.length) {
        this.noImgError(charCode);
      }

      const charImgFilePath = join(
        charDirPath,
        charFiles[Math.floor(Math.random() * charFiles.length)],
      );

      return loadImage(charImgFilePath);
    });

    return Promise.all(promisedImageFilePaths);
  }

  private randomOffset(factor: number): number {
    return (Math.random() - 0.5) * factor;
  }

  private randomRotation(degree: number): number {
    return ((Math.random() - 0.5) * degree * Math.PI) / 180;
  }

  private normalizeFactor(factor = 0.2, maxAttributeValue: number): number {
    factor = Math.max(0, Math.min(factor, 1));
    return maxAttributeValue * factor;
  }

  private sanitizeParams(body: Prompt): void {
    this.cls.set(
      'lineSpacing',
      this.normalizeFactor(body.lineSpacingFactor, MAX_LINE_SPACING_PX),
    );

    this.cls.set(
      'letterSpacing',
      this.normalizeFactor(body.letterSpacingFactor, MAX_LETTER_SPACING_PX),
    );

    this.cls.set(
      'maxXOffset',
      this.normalizeFactor(body.positionRandomOffsetFactor, MAX_X_OFFSET_PX),
    );

    this.cls.set(
      'maxYOffset',
      this.normalizeFactor(body.positionRandomOffsetFactor, MAX_Y_OFFSET_PX),
    );

    this.cls.set(
      'maxSizeDeviation',
      this.normalizeFactor(body.sizeRandomFactor, MAX_SIZE_DEVIATION_PX),
    );

    this.cls.set(
      'maxRotation',
      this.normalizeFactor(
        body.rotationRandomDegreeFactor,
        MAX_CHAR_ROTATION_PX,
      ),
    );
  }
}
