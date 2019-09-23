import { Event } from "dryads/utils/iterators";
import { MsgType } from "../../Types";
export interface OSCEvent extends Event {
    msgs: MsgType[];
}
interface Memo {
    i: number;
}
interface Next {
    event: OSCEvent;
    memo: Memo;
}
declare type GetNextFn = (now: number, memo: Memo) => Next | undefined;
/**
 * Just in time osc scheduler used by scserver middleware
 * to send OSC messages.
 *
 * This is used by the scserver middleware.
 *
 * It is used by calling `.schedLoop(getNext, epoch)`
 */
export default class OSCSched {
    sendFn: Function;
    latency: number;
    setTimeout: Function;
    clearTimeout: Function;
    getNextFn: GetNextFn;
    epoch: number;
    timerId?: number;
    /**
     * constructor -
     *
     * @param  {Function} sendFn                   Function that sends OSC bundles to the server.
     *                                             args: (time, msgs)
     * @param  {number} latency=0.05               Just-in-time latency in seconds.
     *                                             Bundles are schedule in the javascript process
     *                                             and sent to the server just before the event time.
     * @param  {Function} setTimeoutFn=setTimeout  JavaScript setTimeout (injectable for mocking tests)
     * @param  {Function} clearTimeoutFn=clearTimeout JavaScript setInterval (injectable for mocking tests)
     */
    constructor(sendFn: Function, latency?: number, setTimeoutFn?: Function, clearTimeoutFn?: Function);
    /**
     * schedLoop - start a loop that gets the next event and schedules it to be sent
     *
     * @param  {Function} getNextFn A function that returns the next event object to send.
     *
     *                              Args: now, memo
     *
     *                              Returns an object:
     *
     *                              {time: secondsSinceEpoch, msgs: [], memo: {}}
     *
     *                              If it does not return anything (void) then the loop will end.
     *
     *                              memo is an object that the loop function can store
     *                              state in. eg. list index for an iterator
     *
     *                              msgs may be an array of osc messages or a function
     *                              called at send time that will return an array of osc messages.
     *
     * @param  {float} epoch     Javascript timestamp (milliseconds since 1970 UTC)
     */
    schedLoop(getNextFn: GetNextFn, epoch?: number): void;
    _schedNext(memo?: Memo, logicalNow?: number): void;
    /**
     * _jitSend - schedule to send the event just before it should play on the server.
     *
     * Cancels any previously scheduled event.
     *
     * @param  {float} delta seconds to wait
     * @param  {object} event With .msgs .time and optional .memo
     *                        to be passed to the next call to getNextFn
     */
    _jitSend(now: number, delta: number, next: Next): void;
    /**
     * _send - send the OSC bundle
     *
     * @param  {object} event
     */
    _send(event: OSCEvent): void;
}
export {};
