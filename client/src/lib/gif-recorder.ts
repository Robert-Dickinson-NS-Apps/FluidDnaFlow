declare const GIF: any;

export class GifRecorder {
  private gif: any = null;
  private recording = false;
  private frameCount = 0;
  private maxFrames = 100;
  private frameDelay = 100;

  constructor(options?: { maxFrames?: number; frameDelay?: number }) {
    this.maxFrames = options?.maxFrames ?? 100;
    this.frameDelay = options?.frameDelay ?? 100;
  }

  async loadGifJs(): Promise<void> {
    return new Promise((resolve, reject) => {
      if ((window as any).GIF) {
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load gif.js'));
      document.head.appendChild(script);
    });
  }

  async start(width: number, height: number): Promise<void> {
    await this.loadGifJs();
    
    this.gif = new (window as any).GIF({
      workers: 2,
      quality: 10,
      width,
      height,
      workerScript: 'https://cdn.jsdelivr.net/npm/gif.js@0.2.0/dist/gif.worker.js',
    });
    
    this.recording = true;
    this.frameCount = 0;
  }

  addFrame(canvas: HTMLCanvasElement): boolean {
    if (!this.recording || !this.gif) return false;
    
    if (this.frameCount >= this.maxFrames) {
      return false;
    }
    
    this.gif.addFrame(canvas, { delay: this.frameDelay, copy: true });
    this.frameCount++;
    return true;
  }

  stop(): Promise<Blob> {
    return new Promise((resolve, reject) => {
      if (!this.gif) {
        reject(new Error('No recording in progress'));
        return;
      }

      this.recording = false;

      this.gif.on('finished', (blob: Blob) => {
        resolve(blob);
      });

      this.gif.on('error', (error: Error) => {
        reject(error);
      });

      this.gif.render();
    });
  }

  isRecording(): boolean {
    return this.recording;
  }

  getFrameCount(): number {
    return this.frameCount;
  }

  getMaxFrames(): number {
    return this.maxFrames;
  }

  getProgress(): number {
    return this.frameCount / this.maxFrames;
  }
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
