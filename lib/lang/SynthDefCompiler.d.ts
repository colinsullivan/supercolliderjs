/// <reference types="node" />
import Server from "../server/server";
import { CallAndResponse } from "../Types";
import SCLang from "./sclang";
export interface SynthDefResultType {
    name: string;
    bytes: Buffer;
    synthDesc: {
        sourceCode?: string;
    };
}
interface SynthDefResultMapType {
    [defName: string]: SynthDefResultType;
}
interface SynthDefCompileRequestWithSource {
    source: string;
}
interface SynthDefCompileRequestWithPath {
    path: string;
}
export declare type SynthDefCompileRequest = SynthDefCompileRequestWithSource | SynthDefCompileRequestWithPath;
/**
 * Utility class to compile SynthDefs either from source code or by loading a path.
 *
 * Stores metadata, watches path for changes and can resend on change.
 * Can write compiled synthDefs to .scsyndef
 *
 * @ member of lang
 */
export default class SynthDefCompiler {
    lang?: SCLang;
    store: Map<string, SynthDefResultType>;
    constructor(lang?: SCLang);
    boot(): Promise<SCLang>;
    /**
     * Returns an object with each compiled synthdef
     * as a SynthDefResultType.
     */
    compile(defs: object): Promise<SynthDefResultMapType>;
    /**
     * Compile SynthDefs and send them to the server.
     *
     * @returns a Promise for {defName: SynthDefResult, ...}
     */
    compileAndSend(defs: object, server: Server): Promise<SynthDefResultMapType>;
    set(defName: string, data: SynthDefResultType): SynthDefResultType;
    get(defName: string): SynthDefResultType | undefined;
    allSendCommands(): CallAndResponse[];
    sendCommand(defName: string): CallAndResponse;
    private _compileOne;
    /**
     * Returns a Promise for a SynthDef result object: name, bytes, synthDesc
     */
    compileSource(sourceCode: string, pathName?: string): Promise<SynthDefResultType>;
    /**
     * Returns a Promise for a SynthDef result object: name, bytes, synthDesc
     */
    compilePath(sourcePath: string): Promise<SynthDefResultType>;
}
export {};
