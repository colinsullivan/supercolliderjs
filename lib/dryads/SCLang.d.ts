import { Dryad } from "dryadic";
import { SCLangArgs } from "../lang/sclang";
interface Properties {
    options: SCLangArgs;
}
/**
 * Boots a new SuperCollider language interpreter (sclang) making it available for all children as context.sclang
 *
 * Always boots a new one, ignoring any possibly already existing one in the parent context.
 *
 * `options` are the command line options supplied to sclang (note: not all options are passed through yet)
 * see {@link lang/SCLang}
 *
 * Not to be confused with the other class named SCLang which does all the hard work.
 * This Dryad class is just a simple wrapper around that.
 */
export default class SCLang extends Dryad<Properties> {
    defaultProperties(): Properties;
    prepareForAdd(): object;
    remove(): object;
}
export {};
