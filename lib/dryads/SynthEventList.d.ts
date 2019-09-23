import { Dryad, DryadPlayer } from "dryadic";
import { Params } from "../server/osc/msg";
import { OscType } from "../Types";
import { OSCEvent } from "./middleware/OSCSched";
import { Event } from "./utils/iterators";
interface SynthEvent extends Event {
    defName: string;
    args: {
        [name: string]: OscType;
    };
}
interface Properties {
    events: SynthEvent[];
    loopTime?: number;
    defaultParams?: Params;
    updateStream?: any;
}
interface Context {
    group: number;
    out: number;
    epoch: number;
    subscription?: any;
    id: string;
}
interface AddCommand {
    scserver: {
        schedLoop: (context: Context, properties: Properties) => Function;
    };
    run?: (context: Context, properties: Properties) => void;
}
/**
 * Takes a list of synth event objects with relative times and schedules them.
 *
 * ## properties
 *
 * __events:__ Array
 *
 * The event values should be simple JavaScript objects:
 *
 *     {
 *       defName: 'synthDefName',
 *       args: {
 *         out: 0,
 *         freq: 440
 *       },
 *       time: 0.3
 *     }
 *
 *  Where time is seconds relative to the epoch. The epoch is the start time of
 *  the dryadic tree, unless a parent Dryad has set a new epoch into context.
 *
 *    epoch: number|Date|undefined
 *      Optional epoch that the event times in the list are relative to.
 *      Can also be updated by the updateStream
 *      default: context.epoch or now
 *
 * __updateStream:__ Bacon stream to push updated event lists of the form:
 *
 *      {
 *        events: [{time: msgs: []}...],
 *        epoch: 123456789
 *      }

 *     .events Array
 *     .epoch  number|Date
 *
 * Deprecated: will be replaced with live updating and setting of
 * Any value in a dryadic document from the player or remote client.
 *
 * Pushing a new event list cancels previous events and schedules new events.
 *
 * Note that by default the epoch will be unchanged: relative times
 * are still relative to when the Dryad tree started playing or when any parent
 * Dryad set an epoch in context. This means you update the currently playing score
 * but it doesn't restart from the beginning, it keeps playing.
 *
 * Optionally you may push an .epoch with the updateStream. This can be a date or timestamp
 * slightly in the future. If you pass "now" then any events at `0.0` will be too late to play.
 *
 * __defaultParams:__ a fixed object into which the event value is merged.
 *
 * __loopTime:__ Play the events continuously in a loop.
 */
export default class SynthEventList extends Dryad<Properties> {
    defaultProperties(): Properties;
    add(player: DryadPlayer): AddCommand;
    _makeSchedLoop(events: SynthEvent[], loopTime: number | undefined, context: Context): Function;
    _makeMsgs(events: SynthEvent[], context: Context): OSCEvent[];
    /**
     * @return {object}  command object
     */
    remove(): object;
    /**
     * @return {Dryad}  Wraps itself in a Group so all child Synth events will be removed on removal of the Group.
     */
    subgraph(): Dryad;
}
export {};
