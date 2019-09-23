/// <reference types="rx-core-binding" />
/// <reference types="node" />
import { EventEmitter } from "events";
import { Subject } from "rx";
import { CallAndResponse, MsgType, OscType } from "../Types";
import Logger from "../utils/logger";
import SendOSC from "./internals/SendOSC";
import Store from "./internals/Store";
import { ServerArgs, ServerOptions } from "./options";
import ServerState from "./ServerState";
/**
 * Server - starts a SuperCollider synthesis server (scsynth)
 * as a child process. Enables OSC communication, subscribe to process events,
 * send call and response OSC messages.
 *
 * SuperCollider comes with an executable called scsynth
 * which can be communicated with via OSC.
 *
 * To send raw OSC messages:
 * ```js
 * server.send.msg('/s_new', ['defName', 440])
 * ```
 *
 * Raw OSC responses can be subscribed to:
 * ```js
 * server.receive.subscribe(function(msg) {
 *   console.log(msg);
 * });
 * ```
 */
export default class Server extends EventEmitter {
    options: ServerOptions;
    address: string;
    /**
     * The process id that nodejs spawn() returns
     */
    process: any;
    isRunning: boolean;
    /**
     * Supports `server.send.msg()` and `server.send.bundle()`
     *
     * You can also subscribe to it and get the OSC messages
     * and bundles that are being sent echoed to you for
     * debugging purposes.
     */
    send: SendOSC;
    /**
     * A subscribeable stream of OSC events received.
     */
    receive: Subject<MsgType>;
    /**
     * A subscribeable stream of STDOUT printed by the scsynth process.
     */
    stdout: Subject<string>;
    /**
     * A subscribeable stream of events related to the scsynth process.
     * Used internally.
     */
    processEvents: Subject<string | Error>;
    /**
     * Holds the mutable server state
     * including allocators and the node state watcher.
     * If a parent stateStore is supplied then it will store within that.
     */
    state: ServerState;
    /**
     * The logger used to print messages to the console.
     */
    log: Logger;
    private osc?;
    private _serverObservers;
    /**
     * @param stateStore - optional parent Store for allocators and node watchers
     */
    constructor(options?: ServerArgs, stateStore?: Store);
    private _initLogger;
    /**
     * Event Emitter emits:
     *    'out'   - stdout text from the server
     *    'error' - stderr text from the server or OSC error messages
     *    'exit'  - when server exits
     *    'close' - when server closes the UDP connection
     *    'OSC'   - OSC responses from the server
     *
     * Emit signals are deprecated and will be removed in 1.0
     *
     * @deprecated
     *
     * Instead use ```server.{channel}.subscribe((event) => { })```
     *
     */
    private _initEmitter;
    private _initSender;
    /**
     * Format the command line args for scsynth.
     *
     * The args built using the options supplied to `Server(options)` or `sc.server.boot(options)`
     *
     * ```js
     *  sc.server.boot({device: 'Soundflower (2ch)'});
     *  sc.server.boot({serverPort: '11211'});
     *  ```
     *
     * Supported arguments:
     *
     *     numAudioBusChannels
     *     numControlBusChannels
     *     numInputBusChannels
     *     numOutputBusChannels
     *     numBuffers
     *     maxNodes
     *     maxSynthDefs
     *     blockSize
     *     hardwareBufferSize
     *     memSize
     *     numRGens - max random generators
     *     numWireBufs
     *     sampleRate
     *     loadDefs - (0 or 1)
     *     inputStreamsEnabled - "01100" means only the 2nd and 3rd input streams
     *                          on the device will be enabled
     *     outputStreamsEnabled,
     *     device - name of hardware device
     *            or array of names for [inputDevice, outputDevice]
     *     verbosity: 0 1 2
     *     restrictedPath
     *     ugenPluginsPath
     *     password - for TCP logins open to the internet
     *     maxLogins - max users that may login
     *
     * Arbitrary arguments can be passed in as options.commandLineArgs
     * which is an array of strings that will be space-concatenated
     * and correctly shell-escaped.
     *
     * Host is currently ignored: it is always local on the same machine.
     *
     * See ServerOptions documentation: http://danielnouri.org/docs/SuperColliderHelp/ServerArchitecture/ServerOptions.html
     *
     * @return {string[]} List of non-default args
     */
    args(): string[];
    /**
     * Boot the server
     *
     * Start scsynth and establish a pipe connection to receive stdout and stderr.
     *
     * Does not connect, so UDP is not yet ready for OSC communication.
     *
     * listen for system events and emit: exit out error
     *
     * @returns {Promise}
     */
    boot(): Promise<Server>;
    _spawnProcess(): void;
    /**
     * quit
     *
     * kill scsynth process
     * TODO: should send /quit first for shutting files
     */
    quit(): void;
    /**
     * Establish connection to scsynth via OSC socket
     *
     * @returns {Promise} - resolves when udp responds
     */
    connect(): Promise<Server>;
    private disconnect;
    /**
     * Send OSC message to server
     *
     * @deprecated - use: `server.send.msg([address, arg1, arg2])``
     * @param {String} address - OSC command string eg. `/s_new` which is referred to in OSC as the address
     * @param {Array} args
     */
    sendMsg(address: string, args: OscType[]): void;
    /**
     * Wait for a single OSC response from server matching the supplied args.
     *
     * This is for getting responses async from the server.
     * The first part of the message matches the expected args,
     * and the rest of the message contains the response.
     *
     * The Promise fullfills with any remaining payload including in the message.
     *
     * @param {Array} matchArgs - osc message to match as a single array: `[/done, /notify]`
     * @param {int} timeout - in milliseconds before the Promise is rejected
     * @returns {Promise}
     */
    oscOnce(matchArgs: MsgType, timeout?: number): Promise<MsgType>;
    /**
     * Send an OSC command that expects a reply from the server,
     * returning a `Promise` that resolves with the response.
     *
     * This is for getting responses async from the server.
     * The first part of the message matches the expected args,
     * and the rest of the message contains the response.
     *
     *  ```js
     *  {
     *      call: ['/some_osc_msg', 1, 2],
     *      response: ['/expected_osc_response', 1, 2, 3]
     *  }```
     * @param {int} timeout - in milliseconds before rejecting the `Promise`
     * @returns {Promise} - resolves with all values the server responsed with after the matched response.
     */
    callAndResponse(callAndResponse: CallAndResponse, timeout?: number): Promise<MsgType>;
}
/**
 * Boot a server with options and connect
 *
 * @param {object} options - command line options for server
 * @param {Store} store - optional external Store to hold Server state
 * @returns {Promise} - resolves with the Server
 */
export declare function boot(options?: ServerArgs, store?: any): Promise<Server>;
