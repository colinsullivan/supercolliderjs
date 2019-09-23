import { Dryad } from "dryadic";
import { OscType } from "../Types";
import { SynthDef } from "./SCSynthDef";
interface SynthParams {
    [name: string]: OscType | Dryad;
}
interface Properties {
    args: SynthParams;
    def: SynthDef | string;
}
/**
 * Creates a synth on the server.
 *
 * Properties:
 * - def
 * - args
 */
export default class Synth extends Dryad<Properties> {
    /**
     * If there is no SCServer in the parent context,
     * then this will wrap itself in an SCServer
     */
    requireParent(): string;
    prepareForAdd(): object;
    add(): object;
    remove(): object;
    _checkOscType(v: any, key: string, id: string): any;
}
export {};
