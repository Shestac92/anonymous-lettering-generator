import { BadRequestException, Injectable } from '@nestjs/common';
import { readdir } from 'fs/promises';
import { resolve, join, extname } from 'path';
import { Image, createCanvas, loadImage } from 'node-canvas';
import { Prompt } from './prompt.interface';

// TODO: https://www.npmjs.com/package/canvas
const SUPPORTED_EXTENSION = '.jpg';
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

@Injectable()
export class AppService {
  private readonly assetsPath = resolve(__dirname, '..', 'assets');

  public async handlePrompt({
    prompt,
    transparent = false,
    lineSpacingFactor,
    letterSpacingFactor,
    positionRandomOffsetFactor,
    rotationRandomDegreeFactor,
    sizeRandomFactor,
  }: Prompt): Promise<any> {
    prompt = this.sanitizePrompt(prompt);
    const lines = this.promptToLines(prompt);

    return this.drawLines(
      lines,
      transparent,
      this.normalizeFactor(lineSpacingFactor, MAX_LINE_SPACING_PX),
      this.normalizeFactor(letterSpacingFactor, MAX_LETTER_SPACING_PX),
      this.normalizeFactor(positionRandomOffsetFactor, MAX_X_OFFSET_PX),
      this.normalizeFactor(positionRandomOffsetFactor, MAX_Y_OFFSET_PX),
      this.normalizeFactor(sizeRandomFactor, MAX_SIZE_DEVIATION_PX),
      this.normalizeFactor(rotationRandomDegreeFactor, MAX_CHAR_ROTATION_PX),
    );
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
    // const words = prompt.split(' ');
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

  private wrapWord(word: string, lines: string[]): string {
    for (let i = 0; i < word.length; i += MAX_CHARS_IN_LINE) {
      const subLine = word.slice(i, i + MAX_CHARS_IN_LINE);

      if (subLine.length < MAX_CHARS_IN_LINE) {
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
    transparent: boolean,
    lineSpacing: number,
    letterSpacing: number,
    maxXOffset: number,
    maxYOffset: number,
    maxSizeDeviation: number,
    maxRotation: number,
  ): Promise<string> {
    const canvasWidth = this.getCanvasWidth(lines, letterSpacing);
    const canvasHeight = this.getCanvasHeight(lines, lineSpacing);

    const canvas = createCanvas(canvasWidth, canvasHeight);
    const ctx = canvas.getContext('2d');

    if (!transparent) {
      ctx.fillStyle = 'white';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    ctx.shadowBlur = 2;
    ctx.shadowColor = 'grey';

    let cursorX = MARGIN_PX;
    let cursorY = MARGIN_PX;

    for (const line of lines) {
      const chars = line.split('');
      const charImgs = await this.getCharImages(chars);

      for (const img of charImgs) {
        if (img) {
          const x = cursorX + this.randomOffset(maxXOffset);
          const y = cursorY + this.randomOffset(maxYOffset);
          const cx = x + CHAR_WIDTH_PX / 2;
          const cy = y + CHAR_HEIGHT_PX / 2;
          const rotation = this.randomRotation(maxRotation);
          const charWidth = CHAR_WIDTH_PX + this.randomOffset(maxSizeDeviation);
          const charHeight =
            CHAR_HEIGHT_PX + this.randomOffset(maxSizeDeviation);

          ctx.translate(cx, cy);
          ctx.rotate(rotation);
          ctx.translate(-cx, -cy);

          ctx.drawImage(img, x, y, charWidth, charHeight);

          ctx.translate(cx, cy);
          ctx.rotate(-rotation);
          ctx.translate(-cx, -cy);
        }
        cursorX += CHAR_WIDTH_PX + letterSpacing;
      }
      cursorY += CHAR_HEIGHT_PX + lineSpacing;
      cursorX = MARGIN_PX;
    }

    return canvas.toBuffer('image/png').toString('base64');
  }

  private imageFilesFilter(fileNames: string[]): string[] {
    return fileNames.filter(
      (fileName) => extname(fileName).toLowerCase() === SUPPORTED_EXTENSION,
    );
  }

  private noImgError(char: string, charCode: number): never {
    throw new BadRequestException(
      `No images for '${char}' with char code '${charCode}' were found`,
    );
  }

  private async getCharImages(chars: string[]): Promise<(Image | undefined)[]> {
    const promisedImageFilePaths = chars.map(async (char) => {
      if (char === ' ') {
        return;
      }

      const charCode = char.charCodeAt(0);
      const charDirPath = join(this.assetsPath, `${charCode}`);

      const charFiles = await readdir(charDirPath)
        .then(this.imageFilesFilter)
        .catch(() => this.noImgError(char, charCode));

      if (!charFiles.length) {
        this.noImgError(char, charCode);
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
}
