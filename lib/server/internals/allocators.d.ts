/**
 * @module allocators
 * @ private
 */
import { Map, List } from "immutable";
declare type BlockMapType = Map<string, List<number>>;
/**
 * A simple incrementing allocator used for nodeIds.
 *
 * The return type is designed to be consistent with the block allocator
 * and other mutating functions used by Server
 *
 * @param {int} state
 * @param {int} initial
 * @returns {Array} [next {int}, state {int}]
 */
export declare function increment(state: number, initial?: number): [number, number];
/**
 * Create initial state for block allocator.
 *
 * @param {int} initialSize - eg. total numChannels
 * @returns {Immutable.Map} state
 */
export declare function initialBlockState(initialSize: number): BlockMapType;
/**
 * Allocates a contigious block of numbers.
 *
 * @param {Immutable.Map} state
 * @param {int} blockSize       - number of numbers eg. numChannels
 * @returns {Array}             - [start number {int}, mutated state {Immutable.Map}]
 */
export declare function allocBlock(state: BlockMapType, blockSize: number): [number, BlockMapType];
/**
 * Return a previously allocated block back to the free list.
 *
 * Defragments by merging with adjoining neighbors where possible
 *
 */
export declare function freeBlock(state: BlockMapType, addr: number, blockSize: number): BlockMapType;
/**
 * Reserve a block by re-writing the free list
 *
 * @param {Immutable.Map} state
 * @param {int} addr
 * @param {int} blockSize
 * @returns {Immutable.Map} state
 * @throws - Block is already allocated
 */
export declare function reserveBlock(state: BlockMapType, addr: number, blockSize: number): BlockMapType;
/**
 * Returns a list of the free blocks and their sizes.
 *
 * @param {Immutable.Map} state
 * @returns {Array} - [[addr, size], ...]
 */
export declare function freeBlockList(state: BlockMapType): FreeBlock[];
/************ private *****************************************/
declare type FreeBlock = [number, number];
export {};
