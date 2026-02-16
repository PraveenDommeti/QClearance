/**
 * Sound Effects System for Sky Guardian
 * Uses Web Audio API for tones and SpeechSynthesis for voice alerts
 */

class SoundEffectsManager {
    private audioContext: AudioContext | null = null;
    private isMuted: boolean = false;

    constructor() {
        // Initialize AudioContext on first user interaction (required by browsers)
        if (typeof window !== 'undefined') {
            document.addEventListener('click', () => this.initAudioContext(), { once: true });
        }
    }

    private initAudioContext() {
        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        }
    }

    private ensureAudioContext() {
        if (!this.audioContext) {
            this.initAudioContext();
        }
        return this.audioContext;
    }

    /**
     * Play a tone with specified frequency and duration
     */
    private playTone(frequency: number, duration: number, type: OscillatorType = 'sine') {
        const ctx = this.ensureAudioContext();
        if (!ctx || this.isMuted) return;

        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.frequency.value = frequency;
        oscillator.type = type;

        // Envelope for smoother sound
        gainNode.gain.setValueAtTime(0, ctx.currentTime);
        gainNode.gain.linearRampToValueAtTime(0.3, ctx.currentTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);

        oscillator.start(ctx.currentTime);
        oscillator.stop(ctx.currentTime + duration);
    }

    /**
     * Play multiple tones in sequence
     */
    private playSequence(notes: Array<{ freq: number; duration: number; type?: OscillatorType }>) {
        let currentTime = 0;
        notes.forEach(note => {
            setTimeout(() => {
                this.playTone(note.freq, note.duration, note.type || 'sine');
            }, currentTime * 1000);
            currentTime += note.duration;
        });
    }

    /**
     * Emergency Alert - Urgent siren sound
     */
    emergencyAlert() {
        if (this.isMuted) return;

        // Alternating high-low siren
        const siren = [
            { freq: 800, duration: 0.2, type: 'square' as OscillatorType },
            { freq: 600, duration: 0.2, type: 'square' as OscillatorType },
            { freq: 800, duration: 0.2, type: 'square' as OscillatorType },
            { freq: 600, duration: 0.2, type: 'square' as OscillatorType },
        ];
        this.playSequence(siren);
    }

    /**
     * Clearance Approved - Ascending chime
     */
    clearanceApproved() {
        if (this.isMuted) return;

        const chime = [
            { freq: 523.25, duration: 0.15 }, // C5
            { freq: 659.25, duration: 0.15 }, // E5
            { freq: 783.99, duration: 0.3 },  // G5
        ];
        this.playSequence(chime);
    }

    /**
     * Fuel Warning - Descending alert
     */
    fuelWarning() {
        if (this.isMuted) return;

        const warning = [
            { freq: 440, duration: 0.2 },  // A4
            { freq: 392, duration: 0.2 },  // G4
            { freq: 349.23, duration: 0.3 }, // F4
        ];
        this.playSequence(warning);
    }

    /**
     * Weather Alert - Quick beeps
     */
    weatherAlert() {
        if (this.isMuted) return;

        const beeps = [
            { freq: 880, duration: 0.1 },
            { freq: 880, duration: 0.1 },
            { freq: 880, duration: 0.1 },
        ];
        this.playSequence(beeps);
    }

    /**
     * Congestion Alert - Low rumble
     */
    congestionAlert() {
        if (this.isMuted) return;

        const rumble = [
            { freq: 220, duration: 0.3, type: 'sawtooth' as OscillatorType },
            { freq: 196, duration: 0.3, type: 'sawtooth' as OscillatorType },
        ];
        this.playSequence(rumble);
    }

    /**
     * New Flight - Gentle notification
     */
    newFlight() {
        if (this.isMuted) return;

        const notification = [
            { freq: 523.25, duration: 0.15 }, // C5
            { freq: 659.25, duration: 0.15 }, // E5
        ];
        this.playSequence(notification);
    }

    /**
     * Voice Alert using SpeechSynthesis
     */
    speak(message: string, urgent: boolean = false) {
        if (this.isMuted || typeof window === 'undefined' || !window.speechSynthesis) return;

        const utterance = new SpeechSynthesisUtterance(message);
        utterance.rate = urgent ? 1.2 : 1.0;
        utterance.pitch = urgent ? 1.2 : 1.0;
        utterance.volume = 0.8;

        window.speechSynthesis.speak(utterance);
    }

    /**
     * Emergency Voice Alert
     */
    announceEmergency(callsign: string) {
        this.emergencyAlert();
        setTimeout(() => {
            this.speak(`Emergency alert. Flight ${callsign} requires immediate attention.`, true);
        }, 800);
    }

    /**
     * Clearance Voice Alert
     */
    announceClearance(callsign: string, type: 'takeoff' | 'landing') {
        this.clearanceApproved();
        setTimeout(() => {
            this.speak(`${callsign}, cleared for ${type}.`, false);
        }, 400);
    }

    /**
     * Fuel Critical Voice Alert
     */
    announceFuelCritical(callsign: string, fuelPercent: number) {
        this.fuelWarning();
        setTimeout(() => {
            this.speak(`Fuel alert. ${callsign} at ${fuelPercent} percent fuel.`, true);
        }, 400);
    }

    /**
     * Mute/Unmute all sounds
     */
    setMuted(muted: boolean) {
        this.isMuted = muted;
        if (muted && typeof window !== 'undefined' && window.speechSynthesis) {
            window.speechSynthesis.cancel();
        }
    }

    isSoundMuted() {
        return this.isMuted;
    }
}

// Singleton instance
export const soundEffects = new SoundEffectsManager();

// Convenience functions
export const playSoundEffect = {
    emergencyAlert: () => soundEffects.emergencyAlert(),
    clearanceApproved: () => soundEffects.clearanceApproved(),
    fuelWarning: () => soundEffects.fuelWarning(),
    weatherAlert: () => soundEffects.weatherAlert(),
    congestionAlert: () => soundEffects.congestionAlert(),
    newFlight: () => soundEffects.newFlight(),
    announceEmergency: (callsign: string) => soundEffects.announceEmergency(callsign),
    announceClearance: (callsign: string, type: 'takeoff' | 'landing') => soundEffects.announceClearance(callsign, type),
    announceFuelCritical: (callsign: string, fuelPercent: number) => soundEffects.announceFuelCritical(callsign, fuelPercent),
};

export default soundEffects;
