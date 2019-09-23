/**
 * OSC utilities

 * This presents a different API than osc-min offers
 *
 * @module utils
 *
 * Wrappers for functions in node-osc-min.
 */
import { MsgType, OscType, OSCTimeType } from "../../Types";
interface OSCMsg {
    address: string;
}
interface OSCSendMsg extends OSCMsg {
    oscType: "message";
    args: OscType[];
}
interface OSCSendBundle {
    oscType: "bundle";
    timetag: OSCTimeType;
    elements: OSCPacket[];
}
declare type OSCPacket = OSCSendBundle | OSCSendMsg;
interface OSCReceiveArg {
    type: "integer" | "float";
    value: number | string;
}
export declare const OSC_TYPE: {
    INTEGER: "integer";
    FLOAT: "float";
};
declare type OscTypeMessage = "message";
export declare const OSC_TYPE_MESSAGE: OscTypeMessage;
interface OSCReceiveMsg extends OSCMsg {
    oscType: "message";
    args: OSCReceiveArg[];
}
interface OSCReceiveBundle {
    oscType: "bundle";
    timetag: OSCTimeType;
    elements: OSCReceiveMsgOrBundle[];
}
declare type OSCReceiveMsgOrBundle = OSCReceiveMsg | OSCReceiveBundle;
/**
 * Convert a received OSC message to a simple Array
 *
 * Converts a message received from scsynth:
 *
 * ```js
 *  {address: '/n_go',
 *    args:
 *     [ object { type: 'integer', value: 1000 },
 *       object { type: 'integer', value: 0 },
 *       object { type: 'integer', value: -1 },
 *       object { type: 'integer', value: 3 },
 *       object { type: 'integer', value: 0 } ],
 *    oscType: 'message' }
 * ```
 *
 * to simple array format:
 *
 * ```js
 * ['/n_go', 1000, 0, -1, 3, 0]
 * ```
 */
export declare function parseMessage(msg: OSCReceiveMsgOrBundle): MsgType;
/**
 * Format an object for osc-min message
 */
export declare function makeMessage(msg: MsgType): OSCSendMsg;
/**
 * Format an object for osc-min bundle
 *
 * @param {null|Number|Array|Date} time -
 *  - null: now, immediately
 *  - number: unix timestamp in seconds
 *  - Array: `[secondsSince1900Jan1, fractionalSeconds]`
 *  - Date
 * @param {Array} packets - osc messages as `[address, arg1, ...argN]`
 *                        or sub bundles as `[{timetag: , packets: }, ...]`
 */
export declare function makeBundle(time: OSCTimeType, packets: MsgType[]): OSCSendBundle;
/**
 * Format children of a bundle as either message or bundle objects.
 *
 * @private
 */
export declare function asPacket(thing: MsgType): OSCSendMsg;
/**
 * Convert a timetag array to a JavaScript Date object in your local timezone.
 *
 * Received OSC bundles that were converted with `fromBuffer` will have a timetag array:
 * `[secondsSince1970, fractionalSeconds]`
 *
 * That has an accuracy of 0.00000000023283 seconds or 2^32 per second or 4,294,979,169.35102864751106 per second.
 *
 * Note that the sample rate for audio is usually only 44.1kHz.
 *
 * timetagToDate reduces the accuracy but is useful for logging a human readable date.
 *
 * Accuracy is reduced to milliseconds, but the returned `Date` object also has
 * `fractionalSecondsInt` and `fractionalSecondsFloat` properties set.
 *
 * @param {Array} ntpTimeTag
 * @returns {Date}
 */
export declare const timetagToDate: any;
/**
 * Convert a JavaScript Date to a NTP timetag array `[secondsSince1970, fractionalSeconds]`.
 *
 * `toBuffer` already accepts Dates for timetags so you might not need this function.
 * If you need to schedule bundles with sub-millisecond accuracy then you
 * could use this to help assemble the NTP array.
 */
export declare const dateToTimetag: any;
/**
 * Make NTP timetag array relative to the current time.
 *
 * @param seconds  - seconds relative to now
 * @param now      - JavaScript timestamp in milliseconds
 * @return `[ntpSecs, ntpFracs]`
 */
export declare function deltaTimeTag(seconds?: number | Date, now?: number | Date): [number, number];
export {};
