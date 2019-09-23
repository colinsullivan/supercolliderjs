export interface Spec {
    minval: number;
    maxval: number;
    warp: string;
}
/**
 * Convert a MIDI note (1..127) to frequency.
 */
export declare function midiToFreq(midiNote: number): number;
/**
 * Convert frequency to MIDI note (1..127).
 */
export declare function freqToMidi(freq: number): number;
/**
 * Map a number from linear min/max to min/max.
 */
export declare function linToLin(inMin: number, inMax: number, outMin: number, outMax: number, value: number): number;
/**
 * Map a number from linear min/max to exponential min/max.
 */
export declare function linToExp(inMin: number, inMax: number, outMin: number, outMax: number, value: number): number;
/**
 * Map a number from exponential min/max to linear min/max.
 */
export declare function expToLin(inMin: number, inMax: number, outMin: number, outMax: number, value: number): number;
/**
 * Map an amplitude value (usually 0..1) to dB.
 */
export declare function ampToDb(amp: number): number;
/**
 * Map dB to an amplitude value that can be used as a multiplier.
 */
export declare function dbToAmp(db: number): number;
/**
 * Returns a function that maps 0..1 input to the spec's minval..maxval with a linear curve.
 */
export declare function linear(spec: Spec): Function;
/**
 * Returns a function that maps 0..1 input to the spec's minval..maxval with an exponential curve. minval/maxval must not have oppositive signs -- ie. the output range must not cross zero.
 */
export declare function exp(spec: Spec): Function;
/**
 * Returns dB mapping function (DbFaderWarp)
 */
export declare function dB(spec: Spec): Function;
/**
 * Returns amp mapping function (FaderWarp)
 */
export declare function fader(spec: Spec): Function;
/**
 * Returns inverse of linear mapping function
 */
export declare function unmapLinear(spec: Spec): Function;
/**
 * Returns inverse of exponential mapping function
 */
export declare function unmapExp(spec: Spec): Function;
/**
 * Returns inverse of dB mapping function (DbFaderWarp)
 */
export declare function unmapDb(spec: Spec): Function;
/**
 * Returns inverse of amp mapping function (FaderWarp)
 */
export declare function unmapFader(spec: Spec): Function;
/**
 * Returns the inverse mapping function for a spec, using the curve
 * as defined by spec.warp
 */
export declare function unmapWithSpec(value: number, spec: Spec): number;
/**
 * Returns the mapping function for a spec, using the curve
 * as defined by spec.warp
 */
export declare function mapWithSpec(value: number, spec: Spec): number;
