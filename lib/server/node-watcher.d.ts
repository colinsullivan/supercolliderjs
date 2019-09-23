/// <reference types="rx-lite" />
import { Disposable } from "rx";
import Server from "./server";
interface NodeStateType {
    parent?: number;
    previous?: number;
    next?: number;
    isGroup: boolean;
    head?: number;
    tail?: number;
    synthDef?: string;
}
/**
 * Watch server OSC receive for any n_XXX messages:
 *
 * - `n_go`
 * - `n_end`
 * - `n_on`
 * - `n_off`
 * - `n_move`
 * - `n_info`
 *
 * Save all of the supplied info for the node
 * and call any registered callbacks.
 *
 * Initially there is no need to unwatch unless you are
 * creating and discarding Server objects which can happen
 * during testing.
 *
 * TODO: add Server.destroy
 *
 * @param {Server} server
 * @returns {Rx.Disposable} - sub.dispose(); to turn it off.
 */
export declare function watchNodeNotifications(server: Server): Disposable;
/**
 * Call a function when the server sends an `/n_go` message
 * One callback allowed per id and node
 * The id is usually a context id but could be a random guid
 *
 * @param {Server} server
 * @param {String} id - unique id for this callback registration
 * @param {int} nodeID
 * @param {Function} handler
 * @returns {Function} - cancel function
 */
export declare function onNodeGo(server: Server, id: string, nodeID: number, handler: Function): Function;
/**
 * Returns a Promise that resolves when the server sends an
 * `/n_go` message.
 *
 * The id is usually a context id (dryadic) but could be any random guid.
 * It can be anything you want to supply as long as it is unique.
 *
 * @param {Server} server
 * @param {String} id - unique id for this callback registration
 * @param {int} nodeID
 * @returns {Promise} - resolves with nodeID
 */
export declare function whenNodeGo(server: Server, id: string, nodeID: number): Promise<number>;
/**
 * Call a function when the server sends an `/n_end` message
 * One callback allowed per id and node.
 *
 * @param {Server} server
 * @param {String} id - unique id for this callback registration
 * @param {int} nodeID
 * @param {Function} handler
 * @returns {Function} - cancel function
 */
export declare function onNodeEnd(server: Server, id: string, nodeID: number, handler: Function): Function;
/**
 * Returns a Promise that resolves when the server sends an `/n_end` message.
 *
 * The id is usually a context id but could be a random guid
 */
export declare function whenNodeEnd(server: Server, id: string, nodeID: number): Promise<number>;
/**
 * Update values in the Server's node state registery.
 *
 * This is for internal use.
 */
export declare function updateNodeState(server: Server, nodeID: number, nodeState: Partial<NodeStateType>): void;
export {};
