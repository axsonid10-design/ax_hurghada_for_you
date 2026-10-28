class SoundManager {
  constructor() {
    this.ctx = null
    this.muted = false
  }

  init() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || window.webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume()
    }
  }

  playTone(freq, type = 'sine', duration = 0.08, gainVal = 0.1) {
    try {
      this.init()
      if (this.muted || !this.ctx) return

      const osc = this.ctx.createOscillator()
      const gain = this.ctx.createGain()

      osc.type = type
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime)

      gain.gain.setValueAtTime(gainVal, this.ctx.currentTime)
      gain.gain.exponentialRampToValueAtTime(0.0001, this.ctx.currentTime + duration)

      osc.connect(gain)
      gain.connect(this.ctx.destination)

      osc.start()
      osc.stop(this.ctx.currentTime + duration)
    } catch {
      // Audio context silently ignored
    }
  }

  playClick() {
    this.playTone(600, 'sine', 0.04, 0.08)
  }

  playSuccess() {
    try {
      this.init()
      if (this.muted || !this.ctx) return
      this.playTone(523.25, 'triangle', 0.08, 0.12)
      setTimeout(() => this.playTone(659.25, 'triangle', 0.08, 0.12), 80)
      setTimeout(() => this.playTone(783.99, 'triangle', 0.15, 0.15), 160)
    } catch {
      // Audio context silently ignored
    }
  }

  playAlert() {
    try {
      this.init()
      if (this.muted || !this.ctx) return
      this.playTone(400, 'sawtooth', 0.1, 0.12)
      setTimeout(() => this.playTone(320, 'sawtooth', 0.15, 0.12), 120)
    } catch {
    }
  }

  playTrash() {
    try {
      this.init()
      if (this.muted || !this.ctx) return
      this.playTone(350, 'square', 0.08, 0.12)
      setTimeout(() => this.playTone(220, 'square', 0.12, 0.14), 70)
    } catch {
    }
  }
}

export const soundManager = new SoundManager()
