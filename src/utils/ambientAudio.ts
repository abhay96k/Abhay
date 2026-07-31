class AmbientSynth {
  private ctx: AudioContext | null = null;
  private filter: BiquadFilterNode | null = null;
  private mainGain: GainNode | null = null;
  private oscillators: OscillatorNode[] = [];
  private gainNodes: GainNode[] = [];
  private isPlaying = false;
  private intervalId: ReturnType<typeof setInterval> | null = null;

  start() {
    if (this.isPlaying) return;
    this.isPlaying = true;

    // Initialize AudioContext compatibility
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;

    this.ctx = new AudioContextClass();
    
    // Create master gain control
    this.mainGain = this.ctx.createGain();
    this.mainGain.gain.setValueAtTime(0, this.ctx.currentTime);
    // Smooth fade-in of background music (3 seconds)
    this.mainGain.gain.linearRampToValueAtTime(0.12, this.ctx.currentTime + 3);

    // Create a low-pass filter to ensure sound is soft, dark, and ambient
    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = 'lowpass';
    this.filter.frequency.setValueAtTime(320, this.ctx.currentTime); // Soft cutoff
    this.filter.Q.setValueAtTime(1.2, this.ctx.currentTime);

    // Route: Oscillators -> Filter -> Main Gain -> Speakers
    this.filter.connect(this.mainGain);
    this.mainGain.connect(this.ctx.destination);

    // Earthy, warm cinematic chord progression frequencies:
    // Chord 1: Fmaj9 (F2, C3, E3, A3, G4)
    // Chord 2: Cmaj9 (C2, G2, B2, E3, D4)
    // Chord 3: Am9 (A2, E3, G3, C4, B4)
    // Chord 4: G6 (G2, D3, G3, B3, E4)
    const chords = [
      [87.31, 130.81, 164.81, 220.00, 392.00], // Fmaj9
      [65.41, 98.00, 123.47, 164.81, 293.66],  // Cmaj9
      [110.00, 164.81, 196.00, 261.63, 493.88], // Am9
      [98.00, 146.83, 196.00, 246.94, 329.63]   // G6
    ];

    let chordIndex = 0;

    const playChord = (frequencies: number[]) => {
      if (!this.ctx || !this.filter) return;

      const now = this.ctx.currentTime;

      // Gracefully fade out and stop previous chord oscillators
      this.oscillators.forEach((osc, i) => {
        try {
          const currentGain = this.gainNodes[i];
          currentGain.gain.setValueAtTime(currentGain.gain.value, now);
          currentGain.gain.exponentialRampToValueAtTime(0.0001, now + 3); // 3-second release
          osc.stop(now + 3.1);
        } catch {
          // Guard against inactive nodes
        }
      });

      this.oscillators = [];
      this.gainNodes = [];

      // Start new chord voicing
      frequencies.forEach((freq, idx) => {
        if (!this.ctx || !this.filter) return;

        const osc = this.ctx.createOscillator();
        // Blend warm triangle (analog pad feel) and sine (pure fundamental warmth)
        osc.type = idx % 2 === 0 ? 'triangle' : 'sine';
        osc.frequency.setValueAtTime(freq, now);
        
        // Add slight frequency detune for rich spatial chorus texture
        osc.detune.setValueAtTime((Math.random() - 0.5) * 10, now);

        const oscGain = this.ctx.createGain();
        oscGain.gain.setValueAtTime(0, now);
        
        // Staggered slow swell attack (3 to 5 seconds per note)
        const attackDuration = 3 + Math.random() * 2;
        oscGain.gain.linearRampToValueAtTime(
          (0.18 / frequencies.length), // Normalized balance
          now + attackDuration
        );

        osc.connect(oscGain);
        oscGain.connect(this.filter);
        
        osc.start(now);
        
        this.oscillators.push(osc);
        this.gainNodes.push(oscGain);
      });
    };

    // Play first chord immediately
    playChord(chords[chordIndex]);

    // Loop through chord progression every 12 seconds
    this.intervalId = setInterval(() => {
      chordIndex = (chordIndex + 1) % chords.length;
      playChord(chords[chordIndex]);
    }, 12000);
  }

  stop() {
    if (!this.isPlaying) return;
    this.isPlaying = false;

    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }

    const fadeDuration = 2.5; // Smooth fade-out before closing AudioContext
    if (this.ctx && this.mainGain) {
      const now = this.ctx.currentTime;
      try {
        this.mainGain.gain.setValueAtTime(this.mainGain.gain.value, now);
        this.mainGain.gain.linearRampToValueAtTime(0, now + fadeDuration);
      } catch {
        // Fallback for immediate context termination
      }

      setTimeout(() => {
        if (this.ctx) {
          this.ctx.close();
          this.ctx = null;
        }
        this.oscillators = [];
        this.gainNodes = [];
        this.filter = null;
        this.mainGain = null;
      }, (fadeDuration + 0.1) * 1000);
    }
  }
}

export const ambientAudio = new AmbientSynth();
