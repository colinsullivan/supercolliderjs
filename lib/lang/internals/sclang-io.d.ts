/// <reference types="node" />
import { EventEmitter } from "events";
import { SCLangError } from "../../Errors";
export declare enum State {
    NULL = "null",
    BOOTING = "booting",
    COMPILED = "compiled",
    COMPILING = "compiling",
    COMPILE_ERROR = "compileError",
    READY = "ready"
}
export declare class SclangCompileResult {
    version: string;
    stdout: string;
    errors: CompileError[];
    extensionErrors: ExtensionError[];
    duplicateClasses: DuplicateClass[];
    dirs: string[];
}
interface CompileError {
    msg: string;
    file: string;
    line: number;
    char: number;
}
interface ExtensionError {
    forClass: string;
    file: string;
}
interface DuplicateClass {
    forClass: string;
    files: string[];
}
interface SCSyntaxError {
    msg: string | null;
    file: string | null;
    line: number | null;
    charPos: number | null;
    code: string;
}
interface StateChangeHandlers {
    [name: string]: StateChangeHandler[];
}
interface StateChangeHandler {
    re: RegExp;
    fn: (match: RegExpExecArray, text: string) => void | true;
}
interface Response {
    type: string;
    chunks: string[];
}
interface ResponseCollectors {
    [guid: string]: Response;
}
/**
 * Captures STDOUT
 */
interface Capturing {
    [guid: string]: string[];
}
/**
 * Stores calls
 */
interface Calls {
    [guid: string]: ResolveReject;
}
interface ResolveReject<R = any> {
    resolve: (result: R) => void;
    reject: (error: Error | SCLangError) => void;
}
/**
 * This parses the stdout of sclang and detects changes of the
 * interpreter state and converts compilation errors into js objects.
 *
 * Also detects runtime errors and results posted when sc code
 * is evaluated from supercollider.js
 *
 * Convert errors and responses into JavaScript objects
 *
 * Emit events when state changes
 *
 * @private
 */
export declare class SclangIO extends EventEmitter {
    states: StateChangeHandlers;
    responseCollectors: ResponseCollectors;
    capturing: Capturing;
    calls: Calls;
    state: State;
    output: string[];
    result: SclangCompileResult;
    constructor();
    reset(): void;
    /**
     * @param {string} input - parse the stdout of supercollider
     */
    parse(input: string): void;
    setState(newState: State): void;
    makeStates(): StateChangeHandlers;
    /**
     * Register resolve and reject callbacks for a block of code that is being sent
     * to sclang to be interpreted.
     *
     * callbacks - an object with reject, resolve
     */
    registerCall(guid: string, callbacks: ResolveReject): void;
    /**
     * Parse syntax error from STDOUT runtime errors.
     */
    parseSyntaxErrors(text: string): SCSyntaxError;
    /**
     * Push text posted by sclang during library compilation
     * to the .output stack for later procesing
     */
    pushOutputText(text: string): void;
    /**
     * Consume the compilation output stack, merging any results
     * into this.result and resetting the stack.
     */
    processOutput(): void;
    /**
     * Parse library compile errors and information
     * collected from sclang STDOUT.
     */
    parseCompileOutput(text: string): SclangCompileResult;
}
export {};
