import { EventStream } from "baconjs";
import { Dryad, DryadPlayer } from "dryadic";
import { Params } from "../server/osc/msg";
interface Properties {
    stream: EventStream<any, Params>;
}
/**
 * Sends nodeSet messages to the Synth in the parent context.
 *
 * This takes a Bacon.js stream which should return objects
 * {param: value, ...} and sends `nodeSet` messages to the parent Synth.
 *
 * SynthControl should be a child of a Synth, Group or other Dryad that
 * sets context.nodeID
 */
export default class SynthControl extends Dryad<Properties> {
    /**
     * If there is no SCServer in the parent context,
     * then this will wrap itself in an SCServer
     */
    requireParent(): string;
    add(player: DryadPlayer): object;
    remove(): object;
}
export {};
