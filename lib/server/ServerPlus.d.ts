import { SynthDefResultType, SynthDefCompileRequest } from "../lang/SynthDefCompiler";
import Server from "./server";
import { ServerArgs } from "./options";
import Store from "./internals/Store";
import { Params } from "./osc/msg";
/**
 * scsynth Group
 *
 * See `server.group(...)`
 */
declare class Group {
    id: number;
    server: ServerPlus;
    constructor(server: ServerPlus, id: number);
    /**
     * Stop the Group and remove it from the play graph on the server.
     */
    free(): Promise<number>;
    /**
     * Update control parameters on the Synth.
     *
     * @example
     * ```js
     * synth.set({freq: 441, amp: 0.9});
     * ```
     *
     * This method works for Group and Synth.
     * For a Group it sends the set message to all children Synths
     * in the Group.
     */
    set(settings: Params): void;
}
/**
 * scsynth Synth
 *
 * See `server.synth(...)`
 */
declare class Synth extends Group {
}
/**
 * scsynth audio bus

 * See `server.audioBus(...)`
 *
 * These bus numbers (ids) and numChannels are allocated here in the client.
 * The server only gets bus ids for reading and writing to.
 */
declare class AudioBus {
    id: number;
    server: ServerPlus;
    numChannels: number;
    constructor(server: ServerPlus, id: number, numChannels: number);
    /**
     * Deallocate the AudioBus, freeing it for resuse.
     */
    free(): void;
}
/**
 * scsynth control bus

 * See `server.controlBus(...)`
 *
 * These bus numbers (ids) and numChannels are allocated here in the client.
 * The server only gets bus ids for reading and writing to.
 */
declare class ControlBus extends AudioBus {
    /**
     * Deallocate the ControlBus, freeing it for resuse.
     */
    free(): void;
}
/**
 * scsynth Buffer
 *
 * See `server.buffer(...)` and `server.readBuffer(...)`
 */
declare class Buffer {
    id: number;
    server: ServerPlus;
    numFrames: number;
    numChannels: number;
    constructor(server: ServerPlus, id: number, numFrames: number, numChannels: number);
    /**
     * Deallocate the Buffer, freeing memory on the server.
     */
    free(): Promise<void>;
}
/**
 * scsynth SynthDef
 *
 * See `server.synthDefs(...)`
 *
 * These are currently compiled using sclang,
 * and the synthDefResult holds metadata about the compiled
 * synthdef and the raw compiled bytes.
 *
 * The SynthDef may have been compiled from a sourceCode string
 * or compiled from a file at path.
 */
declare class SynthDef {
    server: ServerPlus;
    name: string;
    synthDefResult: SynthDefResultType;
    sourceCode?: string;
    path?: string;
    constructor(server: ServerPlus, defName: string, synthDefResult: SynthDefResultType, sourceCode?: string, path?: string);
}
/**
 * Supplied to synthDefs
 */
/**
 * This extends Server with convienient methods for creating Synth, Group, compiling SynthDefs, creating Buses, Buffers etc.
 *
 * All methods return Promises, and all arguments accept Promises.
 * This means that async actions (like starting a sclang interpreter,
 * compiling SynthDefs and sending them to the server) are complete and their results
 * are ready to be used by whatever they have been supplied to.
 */
export default class ServerPlus extends Server {
    private _synthDefCompiler?;
    /**
     * Create a Synth on the server
     */
    synth(synthDef: SynthDef, args?: Params, group?: Group, addAction?: number): Promise<Synth>;
    /**
     * Create a Group on the server
     */
    group(group?: Group, addAction?: number): Promise<Group>;
    private readonly synthDefCompiler;
    /**
     * Compile multiple SynthDefs either from source or path.
     * If you have more than one to compile then always use this
     * as calling `server.synthDef` multiple times will start up
     * multiple supercollider interpreters. This is harmless, but
     * you do have a lot of icons bouncing in your dock.
     *
     * @param defs - An object with `{defName: spec, ...}` where spec is
     *               an object like `{source: "SynthDef('noise', { ...})"}`
     *               or `{path: "./noise.scd"}`
     * @returns An object with the synthDef names as keys and Promises as values.
     *                    Each Promise will resolve with a SynthDef.
     *                    Each Promises can be supplied directly to `server.synth()`
     */
    synthDefs(defs: {
        [defName: string]: SynthDefCompileRequest;
    }): {
        [defName: string]: Promise<SynthDef>;
    };
    private _compileSynthDef;
    /**
     * Load and compile a SynthDef from path and send it to the server.
     */
    loadSynthDef(defName: string, path: string): Promise<SynthDef>;
    /**
     * Compile a SynthDef from supercollider source code and send it to the server.
     */
    synthDef(defName: string, sourceCode: string): Promise<SynthDef>;
    /**
     * Allocate a Buffer on the server.
     */
    buffer(numFrames: number, numChannels?: number): Promise<Buffer>;
    /**
     * Allocate a Buffer on the server and load a sound file into it.
     *
     * Problem: scsynth uses however many channels there are in the sound file,
     * but the client (sclang or supercolliderjs) doesn't know how many there are.
     */
    readBuffer(path: string, numChannels?: number, startFrame?: number, numFramesToRead?: number): Promise<Buffer>;
    /**
     * Allocate an audio bus.
     */
    audioBus(numChannels?: number): AudioBus;
    /**
     * Allocate a control bus.
     */
    controlBus(numChannels?: number): ControlBus;
}
/**
 * Start the scsynth server with options:
 *
 * ```js
 *   let server = await sc.server.boot({device: 'Soundflower (2ch)'});
 * ```
 *
 * @memberof server
 *
 * @param options - Optional command line options for server
 * @param store - optional external Store to hold Server state
 */
export declare function boot(options?: ServerArgs, store?: Store): Promise<ServerPlus>;
export {};
