"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var child_process_1 = require("child_process");
var cuid_1 = tslib_1.__importDefault(require("cuid"));
var events_1 = require("events");
var fs_1 = tslib_1.__importDefault(require("fs"));
var js_yaml_1 = tslib_1.__importDefault(require("js-yaml"));
var lodash_1 = tslib_1.__importDefault(require("lodash"));
var path_1 = tslib_1.__importDefault(require("path"));
var temp_1 = tslib_1.__importDefault(require("temp"));
var untildify_1 = tslib_1.__importDefault(require("untildify"));
var Errors_1 = require("../Errors");
var logger_1 = tslib_1.__importDefault(require("../utils/logger"));
var sclang_io_1 = require("./internals/sclang-io");
var defaults = {
    debug: false,
    echo: true,
    // TODO resolve executable
    sclang: "sclang",
    failIfSclangConfIsMissing: false,
    stdin: false,
    conf: {
        includePaths: [],
        excludePaths: [],
        postInlineWarnings: false,
    },
};
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
var SCLang = /** @class */ (function (_super) {
    tslib_1.__extends(SCLang, _super);
    /*
     * @param {object} options - sclang command line options
     */
    function SCLang(options) {
        var _this = _super.call(this) || this;
        _this.options = lodash_1.default.defaults(options, defaults);
        // bwd compat
        if (options) {
            // Move these from root of options into .conf
            var deprec = ["includePaths", "excludePaths", "postInlineWarnings"];
            _this.options.conf = lodash_1.default.defaults(lodash_1.default.pick(options, deprec), _this.options.conf);
            for (var _i = 0, deprec_1 = deprec; _i < deprec_1.length; _i++) {
                var d = deprec_1[_i];
                delete _this.options[d];
            }
        }
        _this.log = new logger_1.default(_this.options.debug, _this.options.echo, _this.options.log);
        _this.log.dbug(_this.options);
        _this.stateWatcher = _this.makeStateWatcher();
        return _this;
    }
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
    SCLang.prototype.args = function (options) {
        var o = [];
        o.push("-i", "supercolliderjs");
        if (options.executeFile) {
            o.push(options.executeFile);
        }
        o.push("-u", String(options.langPort));
        if (options.conf) {
            o.push("-l", options.conf);
        }
        return o;
    };
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
    SCLang.prototype.makeSclangConfig = function (conf) {
        /**
          write options as yaml to a temp file
          and return the path
        **/
        var str = js_yaml_1.default.safeDump(conf, { indent: 4 });
        return new Promise(function (resolve, reject) {
            temp_1.default.open("sclang-conf", function (err, info) {
                if (err) {
                    return reject(err);
                }
                fs_1.default.write(info.fd, str, function (err2) {
                    if (err2) {
                        reject(err2);
                    }
                    else {
                        fs_1.default.close(info.fd, function (err3) {
                            if (err3) {
                                reject(err3);
                            }
                            else {
                                resolve(info.path);
                            }
                        });
                    }
                });
            });
        });
    };
    SCLang.prototype.isReady = function () {
        return this.stateWatcher.state === sclang_io_1.State.READY;
    };
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
    SCLang.prototype.boot = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var conf, confPath;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.setState(sclang_io_1.State.BOOTING);
                        conf = this.sclangConfigOptions(this.options);
                        return [4 /*yield*/, this.makeSclangConfig(conf)];
                    case 1:
                        confPath = _a.sent();
                        return [2 /*return*/, this.spawnProcess(this.options.sclang, lodash_1.default.extend({}, this.options, { conf: confPath }))];
                }
            });
        });
    };
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
    SCLang.prototype.spawnProcess = function (execPath, commandLineOptions) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var done = false;
            _this.process = _this._spawnProcess(execPath, _this.args(commandLineOptions));
            if (!(_this.process && _this.process.pid)) {
                reject(new Error("Failed to spawn process: " + execPath));
                return;
            }
            var bootListener = function (state) {
                if (state === sclang_io_1.State.READY) {
                    done = true;
                    _this.removeListener("state", bootListener);
                    resolve(_this.stateWatcher.result);
                }
                else if (state === sclang_io_1.State.COMPILE_ERROR) {
                    done = true;
                    reject(new Errors_1.SCError("CompileError", _this.stateWatcher.result));
                    _this.removeListener("state", bootListener);
                    // probably should remove all listeners
                }
            };
            // temporary listener until booted ready or compileError
            // that removes itself
            _this.addListener("state", bootListener);
            setTimeout(function () {
                if (!done) {
                    _this.log.err("Timeout waiting for sclang to boot");
                    // force it to finalize
                    _this.stateWatcher.processOutput();
                    // bootListener above will reject the promise
                    _this.stateWatcher.setState(sclang_io_1.State.COMPILE_ERROR);
                    _this.removeListener("state", bootListener);
                }
            }, 10000);
            // long term listeners
            if (_this.process) {
                _this.installListeners(_this.process, Boolean(_this.options.stdin));
            }
        });
    };
    SCLang.prototype._spawnProcess = function (execPath, commandLineOptions) {
        return child_process_1.spawn(execPath, commandLineOptions, {
            cwd: path_1.default.dirname(execPath),
        });
    };
    /**
     * sclangConfigOptions
     *
     * Builds the options that will be written to the conf file that is read by sclang
     * If supercolliderjs-conf specifies a sclang_conf path
     * then this is read and any includePaths and excludePaths are merged
     *
     * throws error if conf cannot be read
     */
    SCLang.prototype.sclangConfigOptions = function (options) {
        var runtimeIncludePaths = [path_1.default.resolve(__dirname, "../../lib/supercollider-js")];
        var defaultConf = {
            postInlineWarnings: false,
            includePaths: [],
            excludePaths: [],
        };
        var sclang_conf = defaultConf;
        if (options.sclang_conf) {
            try {
                sclang_conf = js_yaml_1.default.safeLoad(fs_1.default.readFileSync(untildify_1.default(options.sclang_conf), "utf8"));
            }
            catch (e) {
                // By default allow a missing sclang_conf file
                // so that the language can create it on demand if you use Quarks or LanguageConfig.
                if (!options.failIfSclangConfIsMissing) {
                    // Was the sclang_conf just in the defaults or was it explicitly set ?
                    this.log.dbug(e);
                    sclang_conf = defaultConf;
                }
                else {
                    throw new Error("Cannot open or read specified sclang_conf " + options.sclang_conf);
                }
            }
        }
        return {
            includePaths: lodash_1.default.union(sclang_conf.includePaths, options.conf.includePaths, runtimeIncludePaths),
            excludePaths: lodash_1.default.union(sclang_conf.excludePaths, options.conf.excludePaths),
            postInlineWarnings: lodash_1.default.isUndefined(options.conf.postInlineWarnings)
                ? sclang_conf.postInlineWarnings
                : Boolean(options.conf.postInlineWarnings),
        };
    };
    SCLang.prototype.makeStateWatcher = function () {
        var _this = this;
        var stateWatcher = new sclang_io_1.SclangIO();
        var _loop_1 = function (name_1) {
            stateWatcher.on(name_1, function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                _this.emit.apply(_this, [name_1].concat(args));
            });
        };
        for (var _i = 0, _a = ["interpreterLoaded", "error", "stdout", "state"]; _i < _a.length; _i++) {
            var name_1 = _a[_i];
            _loop_1(name_1);
        }
        return stateWatcher;
    };
    /**
     * listen to events from process and pipe stdio to the stateWatcher
     */
    SCLang.prototype.installListeners = function (subprocess, listenToStdin) {
        var _this = this;
        if (listenToStdin === void 0) { listenToStdin = false; }
        if (listenToStdin) {
            // stdin of the global top level nodejs process
            process.stdin.setEncoding("utf8");
            process.stdin.on("data", function (chunk) {
                if (chunk) {
                    _this.write(chunk, true);
                }
            });
        }
        if (subprocess.stdout) {
            subprocess.stdout.on("data", function (data) {
                var ds = String(data);
                _this.log.dbug(ds);
                _this.stateWatcher.parse(ds);
            });
        }
        if (subprocess.stderr) {
            subprocess.stderr.on("data", function (data) {
                var error = String(data);
                _this.log.stderr(error);
                _this.emit("stderr", error);
            });
        }
        subprocess.on("error", function (err) {
            _this.log.err("ERROR:" + err);
            _this.emit("stderr", err);
        });
        subprocess.on("close", function (code, signal) {
            _this.log.dbug("close " + code + signal);
            _this.emit("exit", code);
            _this.setState(sclang_io_1.State.NULL);
        });
        subprocess.on("exit", function (code, signal) {
            _this.log.dbug("exit " + code + signal);
            _this.emit("exit", code);
            _this.setState(sclang_io_1.State.NULL);
        });
        subprocess.on("disconnect", function () {
            _this.log.dbug("disconnect");
            _this.emit("exit");
            _this.setState(sclang_io_1.State.NULL);
        });
    };
    /**
     * write
     *
     * Send a raw string to sclang to be interpreted
     * callback is called after write is complete.
     */
    SCLang.prototype.write = function (chunk, noEcho) {
        var _this = this;
        if (!noEcho) {
            this.log.stdin(chunk);
        }
        this.log.dbug(chunk);
        if (this.process && this.process.stdin) {
            this.process.stdin.write(chunk, "UTF-8");
            // Send the escape character which is interpreted by sclang as:
            // "evaluate the currently accumulated command line as SC code"
            this.process.stdin.write("\x0c", "UTF-8", function (error) { return error && _this.log.err(error); });
        }
    };
    /**
     * storeSclangConf
     *
     * Store the original configuration path
     * so that it can be accessed by the modified Quarks methods
     * to store into the correct conf file.
     */
    SCLang.prototype.storeSclangConf = function () {
        return tslib_1.__awaiter(this, void 0, void 0, function () {
            var confPath, setConfigPath;
            return tslib_1.__generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.options.sclang_conf) return [3 /*break*/, 2];
                        confPath = path_1.default.resolve(untildify_1.default(this.options.sclang_conf));
                        setConfigPath = 'SuperColliderJS.sclangConf = "' + confPath + '";\n\n';
                        return [4 /*yield*/, this.interpret(setConfigPath, undefined, true, true, true)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, this];
                }
            });
        });
    };
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
    SCLang.prototype.interpret = function (code, nowExecutingPath, asString, postErrors, getBacktrace) {
        var _this = this;
        if (asString === void 0) { asString = false; }
        if (postErrors === void 0) { postErrors = true; }
        if (getBacktrace === void 0) { getBacktrace = true; }
        return new Promise(function (resolve, reject) {
            var escaped = code
                .replace(/[\n\r]/g, "__NL__")
                .replace(/\\/g, "__SLASH__")
                .replace(/"/g, '\\"');
            var guid = cuid_1.default();
            var args = [
                '"' + guid + '"',
                '"' + escaped + '"',
                nowExecutingPath ? '"' + nowExecutingPath + '"' : "nil",
                asString ? "true" : "false",
                postErrors ? "true" : "false",
                getBacktrace ? "true" : "false",
            ].join(",");
            _this.stateWatcher.registerCall(guid, { resolve: resolve, reject: reject });
            _this.write("SuperColliderJS.interpret(" + args + ");", true);
        });
    };
    /**
     * executeFile
     */
    SCLang.prototype.executeFile = function (filename) {
        var _this = this;
        return new Promise(function (resolve, reject) {
            var guid = cuid_1.default();
            _this.stateWatcher.registerCall(guid, { resolve: resolve, reject: reject });
            _this.write("SuperColliderJS.executeFile(\"" + guid + "\", \"" + filename + "\")", true);
        });
    };
    SCLang.prototype.setState = function (state) {
        this.stateWatcher.setState(state);
    };
    SCLang.prototype.compilePaths = function () {
        return this.stateWatcher.result.dirs;
    };
    SCLang.prototype.quit = function () {
        var _this = this;
        return new Promise(function (resolve) {
            var cleanup = function () {
                _this.process = undefined;
                _this.setState(sclang_io_1.State.NULL);
                resolve(_this);
            };
            if (_this.process) {
                _this.process.once("exit", cleanup);
                // request a polite shutdown
                _this.process.kill("SIGINT");
                setTimeout(function () {
                    // 3.6.6 doesn't fully respond to SIGINT
                    // but SIGTERM causes it to crash
                    if (_this.process) {
                        _this.process.kill("SIGTERM");
                        cleanup();
                    }
                }, 250);
            }
            else {
                cleanup();
            }
        });
    };
    /**
     * @deprecated
     *
     * @static
     * @memberof SCLang
     */
    SCLang.boot = boot;
    return SCLang;
}(events_1.EventEmitter));
exports.default = SCLang;
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
function boot(options) {
    return tslib_1.__awaiter(this, void 0, void 0, function () {
        var opts, sclang;
        return tslib_1.__generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    opts = lodash_1.default.defaults(options, defaults);
                    sclang = new SCLang(opts);
                    return [4 /*yield*/, sclang.boot()];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, sclang.storeSclangConf()];
                case 2:
                    _a.sent();
                    return [2 /*return*/, sclang];
            }
        });
    });
}
exports.boot = boot;
//# sourceMappingURL=sclang.js.map