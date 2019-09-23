import { MsgType, CallAndResponse } from "../../Types";
import Server from "../../server/server";
interface Properties {
}
interface Context {
    oscSched?: any;
    epoch?: number;
    scserver: Server;
}
interface Command {
    scserver?: any;
    msg?: any;
    bundle?: any;
    schedLoop?: any;
    callAndResponse?: CallAndResponse;
}
/**
 * Command middlware that sends OSC to the SuperCollider server (scsynth).
 *
 * Command objects are collected from each Dryad (`add()` `remove()`) and
 * this middlware is called for each Dryad that has `scserver` commands.
 *
 * @param {object} command
 *
 * For any of these you may supply a function that is called with context
 * and returns one of these forms.
 *
 * For example, rather than:
 *
 *     msg: ['/n_free', 1005]
 *
 * you would use the context to get the node id to free:
 *
 *     msg: (context) => nodeFree(context.nodeID)
 *
 * Command may have one of these forms:
 *
 * __msg:__ {Array} - OSC message
 *
 *     msg: ['/n_free', 1005]
 *
 * __bundle:__
 *
 *     bundle: {
 *       time: null|Number|Array|Date
 *       packets: Array of OSC messages
 *     }
 *
 * __callAndResponse:__
 *
 *  Returns a Promise. Only used in preparation, not for play / update.
 *  Call and response object creator functions can be found in `osc/msg`
 *
 *     callAndResponse: {
 *       call: oscMessage,
 *       response: oscMessagePattern
 *     }
 *
 * __schedLoop:__
 *
 *     schedLoop: (context) => {
 *      // construct a function that will return successive events to be sent
 *      return (now, memo={i: 0}) => {
 *        return {
 *          // time in seconds relative to the context.epoch
 *          time: 0.4,
 *          msgs: [ ],
 *          // memo will be passed into the loop each time
 *          // and can be used to store iterators and loop state.
 *          memo: {i: memo.i + 1}
 *        }
 *      }
 *     }
 *
 * schedLoop takes a function that iterates through events.
 * See `OSCSched`
 *
 * It uses a just-in-time scheduler, keeping the OSC messages in the node process
 * and only sending them to the server just before they should play. This doesn't overload
 * the server with a glut of messages and also allows cancellation and updating of the messages
 * and makes it easy to implement transport controls and looping.
 *
 *
 * @param {object} context
 * @param {object} properties
 * @return Promise is only returned when using .callAndResponse
 */
export default function scserver(command: Command, context: Context, properties: Properties): Promise<MsgType> | void;
/**
 * Replace any functions in the command object's values with the result of
 * calling the function.
 *
 * eg. msg: (context) => { ... return ['/s_new', ...]; }
 * becomes msg: ['/s_new', ...]
 *
 * Non-functions are passed through.
 */
export declare function resolveFuncs(command: Command, context: Context, properties: Properties): Command;
export {};
