import { Dryad } from "dryadic";
import { ServerArgs } from "../server/options";
import Server from "../server/server";
import Logger from "../utils/logger";
interface Properties {
    options: ServerArgs;
}
interface Context {
    out: number;
    group: number;
    log?: Logger;
    scserver?: Server;
}
/**
 * Boots a new SuperCollider server (scsynth) making it available for all children as `context.scserver`
 *
 * Always boots a new one, ignoring any possibly already existing one in the parent context.
 *
 * `options` are the command line options supplied to scsynth (note: not all options are passed through yet)
 * see {@link Server}
 */
export default class SCServer extends Dryad<Properties> {
    defaultProperties(): Properties;
    initialContext(): Context;
    prepareForAdd(): object;
    remove(): object;
}
export {};
