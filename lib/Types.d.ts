/// <reference types="node" />
/**
 * JSON
 */
export declare type JSONType = string | number | boolean | Date | null | JSONObjectType;
export interface JSONObjectType {
    [x: string]: JSONType | JSONType[];
}
/**
 * OSC
 */
export declare type OscType = string | number | Buffer | CompletionMsg | null;
/**
 * Some scsynth messages accept another OSC message as the last argument,
 * and will execute that message after the first message is completed.
 */
declare type CompletionMsgItem = string | number | Buffer | null;
export declare type CompletionMsg = [string, ...CompletionMsgItem[]];
/**
 * An array of values of OscType
 */
export declare type OscValues = OscType[];
/**
 * OSCTimeType
 *
 *  - null: now, immediately
 *  - number: unix timestamp in seconds
 *  - Array: `[secondsSince1900Jan1, fractionalSeconds]` Most precise
 *  - Date
 */
export declare type OSCTimeType = null | number | [number, number] | Date;
/**
 *  An OSC message is [address, val, val, val...]
 */
export declare type MsgType = [string, ...OscValues];
/**
 * An OSC bundle has a timetag and contains messages or bundles
 * that should be executed at that scheduled time.
 */
export interface BundleType {
    timetag: OSCTimeType;
    packets: MsgType[] | BundleType[];
}
/**
 * Call and response is where an OSC command is sent to the
 * server which later responds with a message matching 'response'.
 */
export interface CallAndResponse {
    call: MsgType;
    response: MsgType;
}
export {};
