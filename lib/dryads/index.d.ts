import SCServer from "./SCServer";
import SCLang from "./SCLang";
import Group from "./Group";
import Synth from "./Synth";
import AudioBus from "./AudioBus";
import SCSynthDef from "./SCSynthDef";
import SynthControl from "./SynthControl";
import SynthStream from "./SynthStream";
import SynthEventList from "./SynthEventList";
import { Dryad, DryadPlayer } from "dryadic";
export { SCServer, SCLang, Group, Synth, AudioBus, SCSynthDef, SynthControl, SynthStream, SynthEventList };
declare type Middleware = Function;
declare type DryadClass = typeof SCServer | typeof SCLang | typeof Group | typeof Synth | typeof AudioBus | typeof SCSynthDef | typeof SynthControl | typeof SynthStream | typeof SynthEventList;
interface Layer {
    middleware: Middleware[];
    classes: DryadClass[];
}
export declare const layer: Layer;
export interface Context {
    [name: string]: any;
}
/**
 * Create a DryadPlayer from a Dryad or hyperscript definition.
 *
 * Automatically includes the supercollider.js layer
 *
 * usage:
 *
 *   var sc = require('supercolliderjs');
 *   var player = sc.dryadic([
 *     'scserver', [
 *       ['group', [
 *         ['synth', {
 *           defName: 'sinosc',
 *           args: {
 *             freq: 440
 *           }
 *         }]
 *       ]
 *   ]);
 *   player.play();
 *   ...
 *   player.stop();
 */
export declare function dryadic(rootDryad?: Dryad, moreLayers?: Layer[], rootContext?: Context): DryadPlayer;
/**
 * Play a Dryad or hyperscript document.
 *
 * usage:
 *
 *   var sc = require('supercolliderjs');
 *   var player = sc.play([
 *     'scserver', [
 *       ['group', [
 *         ['synth', {
 *           defName: 'sinosc',
 *           args: {
 *             freq: 440
 *           }
 *         }]
 *       ]
 *   ]);
 *
 * @param {Dryad|Array} rootDryad - Dryad object or hyperscript document
 * @returns {DryadPlayer}
 */
export declare function play(rootDryad: Dryad): DryadPlayer;
/**
 * Convert hyperscript object to a tree of Dryads.
 *
 * This lookups each class by lower class 'classname'
 * and creates an instance with properties and children.
 */
export declare function h(hgraph: any): Dryad;
