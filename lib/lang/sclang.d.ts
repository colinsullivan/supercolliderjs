/// <reference types="node" />
import { ChildProcess } from "child_process";
import { EventEmitter } from "events";
import { JSONType } from "../Types";
import Logger from "../utils/logger";
import { SclangCompileResult, SclangIO } from "./internals/sclang-io";
export declare type SclangResultType = JSONType;
interface SCLangOptions {
    debug: boolean;
    echo: boolean;
    log?: Console;
    sclang: string;
    sclang_conf?: string;
    stdin: boolean;
    failIfSclangConfIsMissing: boolean;
    conf: SCLangConf;
}
/**
 * These were at the options root. Moving them to .conf
 */
interface BackwardCompatArgs {
    includePaths?: string[];
    excludePaths?: string[];
    postInlineWarnings?: boolean;
}
export declare type SCLangArgs = Partial<SCLangOptions> & BackwardCompatArgs;
/**
 * sclang_conf.yaml format
 */
interface SCLangConf {
    includePaths: string[];
    excludePaths: string[];
    postInlineWarnings: boolean;
}
/**
 * This class manages a supercollider language interpreter process
 * and sends messages to and from it using STDIN / STDOUT.
 *
 *  SuperCollider comes with an executable called sclang
 *  which can be communicated with via stdin/stdout
 *  or via OSC.
 *
 * @memberof of lang
 */
export default class SCLang extends EventEmitter {
    options: SCLangOptions;
    process?: ChildProcess;
    log: Logger;
    stateWatcher: SclangIO;
    constructor(options?: SCLangArgs);
    /**
     * command line args for sclang
     *
     * ```
     *   -d <path>                      Set runtime directory
     *   -D                             Enter daemon mode (no input)
     *   -g <memory-growth>[km]         Set heap growth (default 256k)
     *   -h                             Display this message and exit
     *   -l <path>                      Set library configuration file
     *   -m <memory-space>[km]          Set initial heap size (default 2m)
     *   -r                             Call Main.run on startup
     *   -s                             Call Main.stop on shutdown
     *   -u <network-port-number>       Set UDP listening port (default 57120)
     *   -i <ide-name>                  Specify IDE name (for enabling IDE-specific class code, default "none")
     *   -a                             Standalone mode
     * ```
     */
    args(options: {
        /**
         * Port for lang to connect to scsynth from
         */
        langPort?: number;
        /**
         * Path to sclang conf file
         */
        conf?: string;
        /**
         * Path to .scd file to execute
         */
        executeFile?: string;
    }): string[];
    /**
     * makeSclangConfig
     *
     * make sclang_config.yaml as a temporary file
     * with the supplied values
     *
     * This is the config file that sclang reads, specifying
     * includePaths and excludePaths
     *
     * Resolves with path of written config file.
     */
    makeSclangConfig(conf: SCLangConf): Promise<string>;
    isReady(): boolean;
    /**
     * Start sclang executable as a subprocess.
     *
     * sclang will compile it's class library, and this may result in syntax
     * or compile errors. These errors are parsed and returned in a structured format.
     *
     * Resolves with:
     *
     * ```js
     * {dirs: [compiled directories]}
     * ```
     *
     * or rejects with:
     *
     * ```js
     * {
     *   dirs: [],
     *   compileErrors: [],
     *   parseErrors: [],
     *   duplicateClasses: [],
     *   errors[],
     *   extensionErrors: [],
     *   stdout: 'compiling class library...etc.'
     * }
     * ```
     */
    boot(): Promise<SclangCompileResult>;
    /**
     * spawnProcess - starts the sclang executable
     *
     * sets this.process
     * adds state listeners
     *
     * @param {string} execPath - path to sclang
     * @param {object} commandLineOptions - options for the command line
     *                filtered with this.args so it will only include values
     *                that sclang uses.
     * @returns {Promise}
     *     resolves null on successful boot and compile
     *     rejects on failure to boot or failure to compile the class library
     */
    spawnProcess(execPath: string, commandLineOptions: object): Promise<SclangCompileResult>;
    _spawnProcess(execPath: string, commandLineOptions: string[]): ChildProcess;
    /**
     * sclangConfigOptions
     *
     * Builds the options that will be written to the conf file that is read by sclang
     * If supercolliderjs-conf specifies a sclang_conf path
     * then this is read and any includePaths and excludePaths are merged
     *
     * throws error if conf cannot be read
     */
    sclangConfigOptions(options: SCLangOptions): SCLangConf;
    makeStateWatcher(): SclangIO;
    /**
     * listen to events from process and pipe stdio to the stateWatcher
     */
    installListeners(subprocess: ChildProcess, listenToStdin?: boolean): void;
    /**
     * write
     *
     * Send a raw string to sclang to be interpreted
     * callback is called after write is complete.
     */
    write(chunk: string, noEcho: boolean): void;
    /**
     * storeSclangConf
     *
     * Store the original configuration path
     * so that it can be accessed by the modified Quarks methods
     * to store into the correct conf file.
     */
    storeSclangConf(): Promise<SCLang>;
    /**
     * Interprets code in sclang and returns a Promise.
     *
     * @param {String} code
     *        source code to evaluate
     * @param {String} nowExecutingPath
              set thisProcess.nowExecutingPath
     *        for use in a REPL to evaluate text in a file
     *        and let sclang know what file it is executing.
     * @param {Boolean} asString
     *        return result .asString for post window
     *        otherwise returns result as a JSON object
     * @param {Boolean} postErrors
     *        call error.reportError on any errors
     *        which posts call stack, receiver, args, etc
     * @param {Boolean} getBacktrace
     *        return full backtrace
     * @returns {Promise} results - which resolves with result as JSON or rejects with SCLangError.
     */
    interpret(code: string, nowExecutingPath?: string, asString?: boolean, postErrors?: boolean, getBacktrace?: boolean): Promise<SclangResultType>;
    /**
     * executeFile
     */
    executeFile(filename: string): Promise<unknown>;
    private setState;
    compilePaths(): string[];
    quit(): Promise<SCLang>;
    /**
     * @deprecated
     *
     * @static
     * @memberof SCLang
     */
    static boot: typeof boot;
}
/**
 * Boots an sclang interpreter, resolving options and connecting.
 *
 * @memberof lang
 *
 * commandLineOptions.config - Explicit path to a yaml config file
 * If undefined then it will look for config files in:
 *    - .supercollider.yaml
 *    - ~/.supercollider.yaml
 */
export declare function boot(options?: SCLangArgs): Promise<SCLang>;
export {};
