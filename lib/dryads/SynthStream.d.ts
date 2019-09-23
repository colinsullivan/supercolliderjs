import { EventStream } from "baconjs";
import { Dryad, DryadPlayer } from "dryadic";
import { MsgType } from "Types";
import { Params } from "../server/osc/msg";
import Server from "../server/server";
interface Properties {
    stream: EventStream<any, Event>;
    defaultParams?: Params;
}
interface Context {
    id: string;
    nodeID?: number;
    out?: number;
    group?: number;
    scserver: Server;
    subscription?: any;
    nodeIDs?: {
        [key: string]: number;
    };
}
export interface Event {
    defName: string;
    args?: Params;
    key?: number;
    type?: string;
}
interface SynthStreamEventCommand {
    scserver: {
        bundle: {
            time: number;
            packets: MsgType[];
        };
    };
    updateContext: {
        nodeIDs: {
            [key: string]: number;
        };
    };
}
/**
 * Given a Bacon.js stream that returns objects, this spawns a series of Synths.
 *
 * Properties:
 *  {Bacon.EventStream} stream
 *  {object} defaultParams
 *
 * The event values should be simple JavaScript objects:
 *
 * {
 *   defName: 'synthDefName',
 *   args: {
 *     out: 0,
 *     freq: 440
 *   }
 * }
 *
 * defaultParams is a fixed object into which the event value is merged.
 */
export default class SynthStream extends Dryad<Properties> {
    add(player: DryadPlayer): object;
    commandsForEvent(event: Event, context: Context, properties: Properties): SynthStreamEventCommand;
    handleEvent(event: Event, context: Context, properties: Properties, player: DryadPlayer): void;
    remove(): object;
    subgraph(): Dryad;
}
export {};
