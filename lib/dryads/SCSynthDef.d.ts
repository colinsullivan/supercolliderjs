/// <reference types="node" />
import { Dryad } from "dryadic";
import SCLang from "../lang/sclang";
import Server from "../server/server";
/**
 * `synthDef` is returned from compilation by sclang and
 * is set in the context for children Dryads to access.
 */
interface CompiledSynthDef {
    name: string;
    bytes: Buffer;
    synthDesc: SynthDesc;
}
interface LoadedSynthDef {
    name: string;
}
export declare type SynthDef = CompiledSynthDef | LoadedSynthDef;
export declare type SynthDesc = object;
interface Properties {
    source?: string;
    compileFrom?: string;
    watch: boolean;
    saveToDir?: string;
    loadFrom?: string;
}
interface Context {
    sclang?: SCLang;
    synthDef?: CompiledSynthDef;
    scserver?: Server;
    _watcher?: any;
}
/**
 * Compile a SynthDef from sclang source code
 * or load a precompiled .scsyndef
 *
 * If compilation is required then it will insert SCLang as a parent if necessary.
 *
 *
 *
 * Note that the synthDefName is not known until after the source code is compiled.
 *
 */
export default class SCSynthDef extends Dryad<Properties> {
    properties: Properties;
    /**
     * If there is no SCLang in the parent context,
     * then this will wrap itself in an SCLang (language interpreter).
     */
    requireParent(): string | void;
    prepareForAdd(): object;
    _prepareForAdd(context: Context, properties: Properties): Promise<CompiledSynthDef | LoadedSynthDef>;
    _sendSynthDef(context: Context, properties: Properties, result: CompiledSynthDef): Promise<CompiledSynthDef>;
    _writeSynthDef(name: string, buffer: Buffer, synthDesc: SynthDesc, saveToDir: string): Promise<void>;
    /**
     * Returns a Promise for a SynthDef result object: name, bytes, synthDesc
     */
    compileSource(context: Context, sourceCode: string, pathName?: string): Promise<CompiledSynthDef>;
    /**
     * Returns a Promise for a SynthDef result object: name, bytes, synthDesc
     */
    compileFrom(context: Context, sourcePath: string): Promise<CompiledSynthDef>;
    add(): object;
    remove(): object;
    putSynthDef(context: Context, synthDefName: string, synthDesc: object): void;
    /**
     * Return the value of this object, which is the synthDef: {name, bytes, synthDesc}
     * for use in /s_new.
     */
    value(context: Context): SynthDef;
}
export {};
