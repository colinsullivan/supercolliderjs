"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * @module allocators
 * @ private
 */
var immutable_1 = require("immutable");
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
function increment(state, initial) {
    if (initial === void 0) { initial = 0; }
    // let next = (typeof state === "undefined" ? initial : state) + 1;
    var next = (state || initial) + 1;
    return [next, next];
}
exports.increment = increment;
/**
 * Create initial state for block allocator.
 *
 * @param {int} initialSize - eg. total numChannels
 * @returns {Immutable.Map} state
 */
function initialBlockState(initialSize) {
    var blank = immutable_1.Map({});
    return freeBlock(blank, 0, initialSize);
}
exports.initialBlockState = initialBlockState;
/**
 * Allocates a contigious block of numbers.
 *
 * @param {Immutable.Map} state
 * @param {int} blockSize       - number of numbers eg. numChannels
 * @returns {Array}             - [start number {int}, mutated state {Immutable.Map}]
 */
function allocBlock(state, blockSize) {
    var keys = state.keySeq().sortBy(function (value, key) { return parseInt(value || "0", 10) > (key || 0); });
    var ret;
    keys.forEach(function (sizeKey) {
        if (typeof sizeKey !== "undefined") {
            var size = parseInt(sizeKey, 10);
            if (size >= blockSize) {
                var blocks = state.get(sizeKey);
                if (blocks.size) {
                    if (size === blockSize) {
                        // pop the last free one
                        ret = [blocks.last(), state.set(sizeKey, blocks.butLast().toList())];
                        return false; // break
                    }
                    else {
                        // its larger, split off what you need
                        var lastBlock = blocks.last();
                        ret = [lastBlock, splitFreeBlock(state, lastBlock, size, lastBlock, blockSize)];
                        return false; // break
                    }
                }
            }
        }
    });
    if (!ret) {
        throw new Error("No free block");
    }
    return ret;
}
exports.allocBlock = allocBlock;
/**
 * Return a previously allocated block back to the free list.
 *
 * Defragments by merging with adjoining neighbors where possible
 *
 */
function freeBlock(state, addr, blockSize) {
    state = pushFreeBlock(state, addr, blockSize);
    return mergeNeighbors(state, addr, blockSize);
}
exports.freeBlock = freeBlock;
/**
 * Reserve a block by re-writing the free list
 *
 * @param {Immutable.Map} state
 * @param {int} addr
 * @param {int} blockSize
 * @returns {Immutable.Map} state
 * @throws - Block is already allocated
 */
function reserveBlock(state, addr, blockSize) {
    // check if exact match is on free list
    var removed = state.update(String(blockSize), function (blks) { return (blks ? blks.filter(function (x) { return x !== addr; }).toList() : blks); });
    if (removed !== state) {
        return removed;
    }
    var enc = findEnclosingFreeBlock(state, addr, blockSize);
    if (enc === NOT_FOUND) {
        throw new Error("Block is already allocated! addr:" + addr + " blockSize:" + blockSize + " state:" + state);
    }
    return splitFreeBlock(state, enc[0], enc[1], addr, blockSize);
}
exports.reserveBlock = reserveBlock;
/**
 * Returns a list of the free blocks and their sizes.
 *
 * @param {Immutable.Map} state
 * @returns {Array} - [[addr, size], ...]
 */
function freeBlockList(state) {
    var list = [];
    state.forEach(function (blks, sizeKey) {
        if (blks !== undefined) {
            blks.forEach(function (addr) {
                if (addr !== undefined) {
                    list.push([addr, parseInt(sizeKey || "0", 10)]);
                }
            });
        }
    });
    // sort by addr
    list.sort(function (a, b) { return a[0] - b[0]; });
    return list;
}
exports.freeBlockList = freeBlockList;
var NOT_FOUND = [-1, -1];
/**
 * @param {Immutable.Map} state
 * @param {int} addr
 * @param {int} blockSize
 * @returns {Array} - [blockAddr, blockSize] or NOT_FOUND
 */
function findEnclosingFreeBlock(state, addr, blockSize) {
    // let end = addr + blockSize;
    var found = NOT_FOUND;
    state.forEach(function (blks, sizeKey) {
        if (blks !== undefined && sizeKey) {
            var freeBlockSize_1 = parseInt(sizeKey, 10);
            blks.forEach(function (fblock) {
                if (fblock !== undefined && blockEncloses(addr, blockSize, fblock, freeBlockSize_1)) {
                    found = [fblock, freeBlockSize_1];
                    return false; // break
                }
            });
            if (found !== NOT_FOUND) {
                return false; // break
            }
        }
    });
    return found;
}
/**
 * Tests if a block encloses another block
 *
 * @param {int} addr      - child block
 * @param {int} size
 * @param {int} encBlock - address of the potentially enclosing block being tested
 * @param {int} encSize  - size of the potentially enclosing block being tested
 * @returns {Boolean}
 */
function blockEncloses(
// child block
addr, size, 
// address of the potentially enclosing block being tested
encBlock, 
// size of the potentially enclosing block being tested
encSize) {
    return addr >= encBlock && addr + size <= encBlock + encSize;
}
/**
 * @param {Immutable.Map} state
 * @param {int} addr
 * @param {int} blockSize
 * @returns {Immutable.Map} state
 */
function popFreeBlock(state, addr, blockSize) {
    return state.update(String(blockSize), function (blks) { return (blks ? blks.filter(function (x) { return x !== addr; }).toList() : blks); });
}
/**
 * @param {Immutable.Map} state
 * @param {int} addr
 * @param {int} blockSize
 * @returns {Immutable.Map} state
 */
function pushFreeBlock(state, addr, blockSize) {
    return state.update(String(blockSize), function (blks) { return (blks || immutable_1.List()).push(addr); });
}
/**
 * Split a block into two or three parts.
 *
 * addr/blockSize is the original block that is currently in state.
 * splitAddr/splitSize is being removed from it (its being allocated)
 * and the original free block will be resized
 *
 * If splitAddr/splitSize is at the top or bottom edge then you get 2 parts.
 * If in the middle then you get 3.
 *
 * @param {Immutable.Map} state
 * @param {int} addr
 * @param {int} blockSize
 * @param {int} splitAddr
 * @param {int} splitSize
 * @returns {Immutable.Map} state
 */
function splitFreeBlock(state, addr, blockSize, splitAddr, splitSize) {
    var bottomGap = splitAddr - addr;
    var topGap = endAddr(addr, blockSize) - endAddr(splitAddr, splitSize);
    if (bottomGap > 0 && topGap === 0) {
        return resizeFreeBlock(state, addr, blockSize, addr, bottomGap);
    }
    if (topGap > 0 && bottomGap === 0) {
        return resizeFreeBlock(state, addr, blockSize, endAddr(addr, blockSize) - topGap, topGap);
    }
    if (topGap > 0 && bottomGap > 0) {
        state = popFreeBlock(state, addr, blockSize);
        state = pushFreeBlock(state, addr, bottomGap);
        state = pushFreeBlock(state, endAddr(addr, blockSize) - topGap, topGap);
        return state;
    }
    return state;
}
function resizeFreeBlock(state, addr, blockSize, newAddr, newSize) {
    state = popFreeBlock(state, addr, blockSize);
    state = pushFreeBlock(state, newAddr, newSize);
    return state;
}
function endAddr(addr, blockSize) {
    return addr + blockSize;
}
function mergeNeighbors(state, addr, blockSize) {
    var blockEnd = endAddr(addr, blockSize);
    var nextState = state;
    freeBlockList(state).forEach(function (fb) {
        if (endAddr(fb[0], fb[1]) === addr) {
            // lower neighbor
            nextState = popFreeBlock(nextState, fb[0], fb[1]);
            nextState = popFreeBlock(nextState, addr, blockSize);
            // this is the new me
            addr = fb[0];
            blockSize = fb[1] + blockSize;
            nextState = pushFreeBlock(nextState, addr, blockSize);
        }
        // my end addr is still in the same place
        // even if block has been merged with lower neighbor
        if (fb[0] === blockEnd) {
            // upper neighbor
            nextState = popFreeBlock(nextState, fb[0], fb[1]);
            nextState = popFreeBlock(nextState, addr, blockSize);
            blockSize = blockSize + fb[1];
            nextState = pushFreeBlock(nextState, addr, blockSize);
        }
    });
    return nextState;
}
//# sourceMappingURL=allocators.js.map