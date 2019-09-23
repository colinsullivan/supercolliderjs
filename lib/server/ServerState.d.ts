import Store from "./internals/Store";
import Server from "./server";
/**
 * Holds state for a Server such as node/bus/buffer allocators,
 * node status and SynthDefs compiled.
 *
 * Server has this has as the property: server.state
 *
 * Many of these functions are low-level accessors and allocators
 * useful for building higher-level applications that are easier
 * to use.
 *
 * Each server is stored by its unique address,
 * so multiple Servers can store state in the same
 * global Store object.
 */
export default class ServerState {
    server: Server;
    store: Store;
    /**
     * @param {Server} server
     * @param {Store} store - optional parent Store to use.
     */
    constructor(server: Server, store?: Store);
    resetState(): void;
    /**
     * Mutate a value or object in the server state.
     *
     * @param {String} key - top level key eg. nodeAllocator, controlBufAllocator
     * @param {Function} fn - will receive current state or an empty Map, returns the altered state.
     */
    mutate(key: string, fn: (value: any) => any): void;
    /**
     * Get current state value for the server using an array of keys.
     *
     * @param {String} keys - list of keys eg. `['NODE_WATCHER', 'n_go', 1000]`
     * @param {any} notSetValue - default value to return if empty
     * @returns {any}
     */
    getIn(keys: string[], notSetValue: any): any;
    /**
     * Allocates a node ID to be used for making a synth or group
     *
     * @returns {int}
     */
    nextNodeID(): number;
    /**
     * Allocate an audio bus.
     *
     * @returns {int} bus number
     */
    allocAudioBus(numChannels?: number): number;
    /**
     * Allocate a control bus.
     *
     * @returns {int} bus number
     */
    allocControlBus(numChannels?: number): number;
    /**
     * Free a previously allocate audio bus
     *
     * These require you to remember the channels and it messes it up
     * if you free it wrong. will change to higher level storage.
     *
     * @param {int} index
     * @param {int} numChannels
     */
    freeAudioBus(index: number, numChannels: number): void;
    /**
     * Free a previously allocated control bus
     *
     * These require you to remember the channels and it messes it up
     * if you free it wrong. will change to higher level storage.
     *
     * @param {int} index
     * @param {int} numChannels
     */
    freeControlBus(index: number, numChannels: number): void;
    /**
     * Allocate a buffer id.
     *
     * Note that numChannels is specified when creating the buffer.
     * This allocator makes sure that the neighboring buffers are empty.
     *
     * @param {int} numConsecutive - consecutively numbered buffers are needed by VOsc and VOsc3.
     * @returns {int} - buffer id
     */
    allocBufferID(numConsecutive?: number): number;
    /**
     * Free a previously allocated buffer id.
     *
     * Note that numChannels is specified when creating the buffer.
     *
     * @param {int} index
     * @param {int} numConsecutive - consecutively numbered buffers are needed by VOsc and VOsc3.
     */
    freeBuffer(index: number, numConsecutive: number): void;
    _allocBlock(key: string, numChannels: number): number;
    _freeBlock(key: string, index: number, numChannels: number): void;
    _keys(keys?: string[]): string[];
}
