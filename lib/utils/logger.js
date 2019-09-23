"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/* eslint no-console: 0 */
var chalk_1 = tslib_1.__importDefault(require("chalk"));
var colors = {
    debug: "gray",
    error: "yellow",
    stdout: "green",
    stderr: "red",
    stdin: "blue",
    sendosc: "cyan",
    rcvosc: "magenta",
};
/**
 * A customized logging interface for supercollider.js
 *
 * Has special colors for osc messages and for logging stdin/stdout traffic.
 *
 * @example
 *
 *     log = new Logger(true, true);
 *
 *     log.dbug('a message');
 *     log.err('oh no');
 *     log.stdin('command that I sent')
 *     log.stdout('output from server')
 *     log.stderr('error from server')
 *
 */
var Logger = /** @class */ (function () {
    function Logger(debug, echo, log) {
        if (debug === void 0) { debug = false; }
        if (echo === void 0) { echo = false; }
        if (log === void 0) { log = console; }
        this.debug = debug;
        this.echo = echo;
        this.colorize = typeof log === "undefined";
        this.log = log;
        this.browser = typeof window !== "undefined";
    }
    /**
     * Log debugging information but only if this.debug is true
     */
    Logger.prototype.dbug = function (text) {
        if (this.debug) {
            this.print("debug  ", text, colors.debug);
        }
    };
    /**
     * Log an error.
     */
    Logger.prototype.err = function (text) {
        this.print("error  ", text, colors.error);
    };
    /**
     * Log messages that were sent to stdin or sclang.
     */
    Logger.prototype.stdin = function (text) {
        if (this.echo) {
            this.print("stdin  ", text, colors.stdin);
        }
    };
    /**
     * Log messages that were received from stdout of sclang/scsynth.
     */
    Logger.prototype.stdout = function (text) {
        if (this.echo) {
            this.print("stdout ", text, colors.stdout);
        }
    };
    /**
     * Log messages that were emitted from stderr of sclang/scsynth.
     */
    Logger.prototype.stderr = function (text) {
        if (this.echo) {
            this.print("stderr ", text, colors.stderr);
        }
    };
    /**
     * Log OSC messages sent to scsynth.
     */
    Logger.prototype.sendosc = function (text) {
        if (this.echo) {
            this.print("sendosc", text, colors.sendosc);
        }
    };
    /**
     * Log OSC messages received from scsynth.
     */
    Logger.prototype.rcvosc = function (text) {
        if (this.echo) {
            this.print("rcvosc ", text, colors.rcvosc);
        }
    };
    Logger.prototype.print = function (label, text, color) {
        if (this.browser) {
            console.log("%c" + label, "font-size: 10px; color:" + color, text);
        }
        else {
            // terminal
            if (typeof text !== "string") {
                text = JSON.stringify(text, undefined, 2);
            }
            var lines = text.split("\n"), cleans = [label + ": " + lines[0]], rest = lines
                .slice(1)
                .filter(function (s) { return s.length > 0; })
                .map(function (s) { return "        " + s; });
            var clean = cleans.concat(rest).join("\n");
            if (this.colorize) {
                clean = chalk_1.default[color](clean);
            }
            switch (label.trim()) {
                case "debug":
                case "stdin":
                case "sendosc":
                case "rcvosc":
                    this.log.info(clean);
                    break;
                case "stderr":
                case "error":
                    this.log.error(clean);
                    break;
                default:
                    this.log.info(clean);
            }
        }
    };
    return Logger;
}());
exports.default = Logger;
//# sourceMappingURL=logger.js.map