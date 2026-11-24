// Procedural Web Audio API synthesizer for game feedback (100% browser-local, zero external audio assets)

class SoundEngine {
  private ctx: AudioContext | null = null;
  private muted: boolean = false;

  constructor() {
    try {
      const saved = localStorage.getItem('rpg_muted');
      if (saved === 'true') this.muted = true;
    } catch {
      // Ignore storage errors in restricted iframes
    }
  }

  private getContext(): AudioContext | null {
    if (this.muted) return null;
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public isMuted(): boolean {
    return this.muted;
  }

  public toggleMute(): boolean {
    this.muted = !this.muted;
    try {
      localStorage.setItem('rpg_muted', String(this.muted));
    } catch {
      // Ignore
    }
    if (!this.muted) {
      this.playClick();
    }
    return this.muted;
  }

  private tone(
    freq: number,
    duration: number,
    type: OscillatorType = 'triangle',
    gainVal: number = 0.14,
    delay: number = 0,
    endFreq?: number
  ) {
    const ctx = this.getContext();
    if (!ctx) return;

    const startTime = ctx.currentTime + delay;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = type;
    osc.frequency.setValueAtTime(freq, startTime);
    if (endFreq !== undefined) {
      osc.frequency.exponentialRampToValueAtTime(Math.max(20, endFreq), startTime + duration);
    }

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.linearRampToValueAtTime(gainVal, startTime + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(startTime);
    osc.stop(startTime + duration + 0.02);
  }

  public playClick() {
    this.tone(520, 0.06, 'sine', 0.08, 0, 660);
  }

  public playAttack(critical = false) {
    if (critical) {
      this.tone(240, 0.14, 'sawtooth', 0.14, 0, 620);
      this.tone(523.25, 0.16, 'triangle', 0.15, 0.07, 783.99);
      this.tone(1046.5, 0.2, 'sine', 0.12, 0.13);
    } else {
      this.tone(280, 0.12, 'triangle', 0.13, 0, 140);
      this.tone(420, 0.1, 'sine', 0.1, 0.05, 520);
    }
  }

  public playSpecial() {
    this.tone(330, 0.16, 'sawtooth', 0.12, 0, 660);
    this.tone(440, 0.16, 'triangle', 0.14, 0.08, 880);
    this.tone(659.25, 0.22, 'sine', 0.16, 0.16, 1318.5);
    this.tone(880, 0.3, 'triangle', 0.14, 0.24);
  }

  public playDodge() {
    this.tone(480, 0.12, 'sine', 0.12, 0, 960);
    this.tone(720, 0.14, 'triangle', 0.1, 0.07, 1180);
  }

  public playDefend() {
    this.tone(220, 0.15, 'triangle', 0.14, 0, 320);
    this.tone(320, 0.12, 'sine', 0.1, 0.06, 260);
  }

  public playHeal() {
    this.tone(523.25, 0.12, 'sine', 0.12, 0);
    this.tone(659.25, 0.14, 'sine', 0.12, 0.09);
    this.tone(783.99, 0.22, 'sine', 0.14, 0.18);
  }

  public playEnemyHit() {
    this.tone(160, 0.18, 'sawtooth', 0.15, 0, 58);
    this.tone(110, 0.22, 'square', 0.1, 0.04, 48);
  }

  public playWarning() {
    this.tone(620, 0.09, 'square', 0.06, 0);
    this.tone(480, 0.11, 'square', 0.06, 0.11);
  }

  public playError() {
    this.tone(220, 0.14, 'sawtooth', 0.1, 0, 150);
  }

  public playVictory() {
    const notes = [523.25, 659.25, 783.99, 1046.5];
    notes.forEach((n, i) => {
      this.tone(n, 0.22, 'triangle', 0.14, i * 0.11);
    });
  }

  public playGameOver() {
    const notes = [392.0, 349.23, 311.13, 261.63];
    notes.forEach((n, i) => {
      this.tone(n, 0.28, 'sawtooth', 0.1, i * 0.16);
    });
  }
}

export const sound = new SoundEngine();
