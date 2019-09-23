"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var child_process_1 = require("child_process");
var dgram = tslib_1.__importStar(require("dgram"));
var events_1 = require("events");
var lodash_1 = tslib_1.__importDefault(require("lodash"));
var osc = tslib_1.__importStar(require("osc-min"));
var rx_1 = require("rx");
var logger_1 = tslib_1.__importDefault(require("../utils/logger"));
var resolveOptions_1 = tslib_1.__importDefault(require("../utils/resolveOptions"));
var SendOSC_1 = tslib_1.__importDefault(require("./internals/SendOSC"));
var options_1 = require("./options");
var msg_1 = require("./osc/msg");
var utils_1 = require("./osc/utils");
var ServerState_1 = tslib_1.__importDefault(require("./ServerState"));
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
var Server = /** @class */ (function (_super) {
    tslib_1.__extends(Server, _super);
    /**
     * @param stateStore - optional parent Store for allocators and node watchers
     */
    function Server(options, stateStore) {
        if (options === void 0) { options = options_1.defaults; }
        var _this = _super.call(this) || this;
        _this.options = lodash_1.default.defaults(options, options_1.defaults);
        _this.address = _this.options.host + ":" + _this.options.serverPort;
        _this.process = null;
        _this.isRunning = false;
        _this.send = new SendOSC_1.default();
        _this.receive = new rx_1.Subject();
        _this.stdout = new rx_1.Subject();
        _this.processEvents = new rx_1.Subject();
        _this.log = _this._initLogger();
        _this._initEmitter();
        _this._initSender();
        _this._serverObservers = {};
        _this.state = new ServerState_1.default(_this, stateStore);
        return _this;
    }
    Server.prototype._initLogger = function () {
        var _this = this;
        // scsynth.server options this Server.options
        var log = new logger_1.default(this.options.debug, this.options.echo, this.options.log);
        this.send.subscribe(function (event) {
            // will be a type:msg or type:bundle
            // if args has a type: Buffer in it then compress that
            var out = JSON.stringify(event.payload || event, function (k, v) {
                if (k === "data" && lodash_1.default.isArray(v)) {
                    return lodash_1.default.reduce(v, function (memo, n) { return memo + n.toString(16); }, "");
                }
                return v;
            }, 2);
            if (!_this.osc) {
                out = "[NOT CONNECTED] " + out;
            }
            log.sendosc(out);
        });
        this.receive.subscribe(function (o) {
            log.rcvosc(o);
            // log all /fail responses as error
            if (o[0] === "/fail") {
                log.err(o);
            }
        }, function (err) { return log.err(err); });
        this.stdout.subscribe(function (o) {
            // scsynth doesn't send ERROR messages to stderr
            // if ERROR or FAILURE in output then redirect as though it did
            // so it shows up in logs
            if (o.match(/ERROR|FAILURE/)) {
                log.stderr(o);
            }
            else {
                log.stdout(o);
            }
        }, function (err) { return log.stderr(err); });
        this.processEvents.subscribe(function (o) { return log.dbug(o); }, function (err) { return log.err(err); });
        return log;
    };
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
    Server.prototype._initEmitter = function () {
        var _this = this;
        this.receive.subscribe(function (msg) {
            _this.emit("OSC", msg);
        });
        this.processEvents.subscribe(function () { }, function (err) { return _this.emit("exit", err); });
        this.stdout.subscribe(function (out) { return _this.emit("out", out); }, function (out) { return _this.emit("stderr", out); });
    };
    Server.prototype._initSender = function () {
        var _this = this;
        this.send.on("msg", function (msg) {
            if (_this.osc) {
                var buf = osc.toBuffer(msg);
                _this.osc.send(buf, 0, buf.length, parseInt(_this.options.serverPort), _this.options.host);
            }
        });
        this.send.on("bundle", function (bundle) {
            if (_this.osc) {
                var buf = osc.toBuffer(bundle);
                _this.osc.send(buf, 0, buf.length, parseInt(_this.options.serverPort), _this.options.host);
            }
        });
    };
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
    Server.prototype.args = function () {
        var _this = this;
        var flagMap = {
            numAudioBusChannels: "-a",
            numControlBusChannels: "-c",
            numInputBusChannels: "-i",
            numOutputBusChannels: "-o",
            numBuffers: "-b",
            maxNodes: "-n",
            maxSynthDefs: "-d",
            blockSize: "-z",
            hardwareBufferSize: "-Z",
            memSize: "-m",
            numRGens: "-r",
            numWireBufs: "-w",
            sampleRate: "-S",
            loadDefs: "-D",
            inputStreamsEnabled: "-I",
            outputStreamsEnabled: "-O",
            device: "-H",
            verbosity: "-V",
            zeroConf: "-R",
            restrictedPath: "-P",
            ugenPluginsPath: "-U",
            password: "-p",
            maxLogins: "-l",
        };
        var _a = this.options, serverPort = _a.serverPort, protocol = _a.protocol, commandLineOptions = _a.commandLineOptions;
        var opts = ["-u", serverPort];
        if (protocol === "tcp") {
            throw new Error("Only udp sockets are supported at this time.");
        }
        lodash_1.default.forEach(this.options, function (option, argName) {
            var flag = flagMap[argName];
            if (flag) {
                if (option !== options_1.defaults[argName]) {
                    opts.push(flag);
                    if (lodash_1.default.isArray(option)) {
                        opts.push.apply(opts, option);
                    }
                    else if (lodash_1.default.isString(option)) {
                        opts.push(option);
                    }
                    else {
                        _this.log.err("Bad type in server options: " + argName + " " + option + " " + typeof option);
                    }
                }
            }
        });
        if (lodash_1.default.isArray(commandLineOptions)) {
            opts.push.apply(opts, commandLineOptions);
        }
        return opts.map(String);
    };
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
    Server.prototype.boot = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            _this.isRunning = false;
            try {
                _this._spawnProcess();
            }
            catch (e) {
                reject(e);
            }
            _this._serverObservers.stdout = rx_1.Observable.fromEvent(_this.process.stdout, "data", function (data) { return String(data); });
            _this._serverObservers.stdout.subscribe(function (e) { return _this.stdout.onNext(e); });
            _this._serverObservers.stderr = rx_1.Observable.fromEvent(_this.process.stderr, "data").subscribe(function (out) {
                // just pipe it into the stdout object's error stream
                _this.stdout.onError(out);
            });
            // Keep a local buffer of the stdout text because on Windows it can be split into odd chunks.
            var stdoutBuffer = "";
            // watch for ready message
            _this._serverObservers.stdout
                .takeWhile(function (text) {
                stdoutBuffer += text;
                return !stdoutBuffer.match(/SuperCollider 3 server ready/);
            })
                .subscribe(function () { }, _this.log.err, function () {
                // onComplete
                stdoutBuffer = "";
                _this.isRunning = true;
                resolve(_this);
            });
            setTimeout(function () {
                if (!_this.isRunning) {
                    reject(new Error("Server failed to start in 3000ms"));
                }
            }, 3000);
        });
    };
    Server.prototype._spawnProcess = function () {
        var _this = this;
        var execPath = this.options.scsynth, args = this.args();
        if (!execPath) {
            throw new Error("Missing options.scsynth executable path");
        }
        var logMsg = "Start process: " + execPath + " " + args.join(" ");
        this.processEvents.onNext(logMsg);
        var options = {
            cwd: this.options.cwd,
            detached: false,
            // Environment variables to set for server process
            // eg. SC_JACK_DEFAULT_INPUTS: "system:capture_1,system:capture_2"
            env: this.options.env ? this.options.env : undefined,
        };
        this.process = child_process_1.spawn(execPath, args, options);
        if (!this.process.pid) {
            var error = "Failed to boot " + execPath;
            this.processEvents.onError(error);
            throw new Error(error);
        }
        this.processEvents.onNext("pid: " + this.process.pid);
        // when this parent process dies, kill child process
        var killChild = function () {
            if (_this.process) {
                _this.process.kill("SIGTERM");
                _this.process = null;
            }
        };
        process.on("exit", killChild);
        this.process.on("error", function (err) {
            _this.processEvents.onError(err);
            _this.isRunning = false;
            // this.disconnect()
        });
        this.process.on("close", function (code, signal) {
            _this.processEvents.onError("Server closed. Exit code: " + code + " signal: " + signal);
            _this.isRunning = false;
            // this.disconnect()
        });
        this.process.on("exit", function (code, signal) {
            _this.processEvents.onError("Server exited. Exit code: " + code + " signal: " + signal);
            _this.isRunning = false;
            // this.disconnect()
        });
    };
    /**
     * quit
     *
     * kill scsynth process
     * TODO: should send /quit first for shutting files
     */
    Server.prototype.quit = function () {
        if (this.process) {
            this.disconnect();
            this.process.kill("SIGTERM");
            this.process = null;
        }
    };
    /**
     * Establish connection to scsynth via OSC socket
     *
     * @returns {Promise} - resolves when udp responds
     */
    Server.prototype.connect = function () {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var udpListening = "udp is listening";
            _this.osc = dgram.createSocket("udp4");
            _this.osc.on("listening", function () {
                _this.processEvents.onNext(udpListening);
            });
            _this.osc.on("close", function (e) {
                _this.processEvents.onNext("udp closed: " + e);
                _this.disconnect();
            });
            // pipe events to this.receive
            _this._serverObservers.oscMessage = rx_1.Observable.fromEvent(_this.osc, "message", function (msgbuf) { return osc.fromBuffer(msgbuf); });
            _this._serverObservers.oscMessage.subscribe(function (e) { return _this.receive.onNext(utils_1.parseMessage(e)); });
            _this._serverObservers.oscError = rx_1.Observable.fromEvent(_this.osc, "error");
            _this._serverObservers.oscError.subscribe(function (e) {
                _this.receive.onError(e);
                reject(e);
            });
            // this will trigger a response from server
            // which will cause a udp listening event.
            // After server responds then we are truly connected.
            _this.callAndResponse(msg_1.notify()).then(function () {
                resolve(_this);
            });
        });
    };
    Server.prototype.disconnect = function () {
        if (this.osc) {
            this.osc.close();
            delete this.osc;
        }
        // TODO: its the subscriptions that need to be disposed, these are the Observables
        // this._serverObservers.forEach((obs) => obs.dispose());
        // for (var key in this._serverObservers) {
        //   console.log(key, this._serverObservers[key], this._serverObservers[key].dispose);
        //   this._serverObservers[key].dispose();
        // }
        this._serverObservers = {};
    };
    /**
     * Send OSC message to server
     *
     * @deprecated - use: `server.send.msg([address, arg1, arg2])``
     * @param {String} address - OSC command string eg. `/s_new` which is referred to in OSC as the address
     * @param {Array} args
     */
    Server.prototype.sendMsg = function (address, args) {
        this.send.msg([address].concat(args));
    };
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
    Server.prototype.oscOnce = function (matchArgs, timeout) {
        var _this = this;
        if (timeout === void 0) { timeout = 4000; }
        return new Promise(function (resolve, reject) {
            var subscription = _this.receive.subscribe(function (msg) {
                var command = msg.slice(0, matchArgs.length);
                if (lodash_1.default.isEqual(command, matchArgs)) {
                    var payload = msg.slice(matchArgs.length);
                    resolve(payload);
                    dispose();
                }
            });
            // if timeout then reject and dispose
            var tid = setTimeout(function () {
                dispose();
                reject(new Error("Timed out waiting for OSC response: " + JSON.stringify(matchArgs)));
            }, timeout);
            function dispose() {
                subscription.dispose();
                clearTimeout(tid);
            }
        });
    };
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
    Server.prototype.callAndResponse = function (callAndResponse, timeout) {
        if (timeout === void 0) { timeout = 4000; }
        var promise = this.oscOnce(callAndResponse.response, timeout);
        // if it's valid to send a msg with an array on the end,
        // then change the definition of Msg
        this.send.msg(callAndResponse.call);
        return promise;
    };
    return Server;
}(events_1.EventEmitter));
exports.default = Server;
/**
 * Boot a server with options and connect
 *
 * @param {object} options - command line options for server
 * @param {Store} store - optional external Store to hold Server state
 * @returns {Promise} - resolves with the Server
 */
function boot(options, store) {
    if (options === void 0) { options = options_1.defaults; }
    if (store === void 0) { store = null; }
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var opts, s;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, resolveOptions_1.default(null, options)];
                case 1:
                    opts = _a.sent();
                    s = new Server(opts, store);
                    return [4 /*yield*/, s.boot()];
                case 2:
                    _a.sent();
                    return [4 /*yield*/, s.connect()];
                case 3:
                    _a.sent();
                    return [2 /*return*/, s];
            }
        });
    });
}
exports.boot = boot;
//# sourceMappingURL=server.js.map