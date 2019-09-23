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
export default class Logger {
    /**
     *Post all debugging calls to log.
     * If false then only errors are posted.
     *
     * @type {boolean}
     * @memberof Logger
     */
    private debug;
    /**
     * Echo stdin/stdout and osc traffic to console
     *
     * @type {boolean}
     * @memberof Logger
     */
    private echo;
    /**
     * Default is to use console.(log|error|info)
     *  but any object with a compatible API such
     *  as winston will work.
     */
    private log;
    private colorize;
    private browser;
    constructor(debug?: boolean, echo?: boolean, log?: Console);
    /**
     * Log debugging information but only if this.debug is true
     */
    dbug(text: any): void;
    /**
     * Log an error.
     */
    err(text: any): void;
    /**
     * Log messages that were sent to stdin or sclang.
     */
    stdin(text: any): void;
    /**
     * Log messages that were received from stdout of sclang/scsynth.
     */
    stdout(text: any): void;
    /**
     * Log messages that were emitted from stderr of sclang/scsynth.
     */
    stderr(text: any): void;
    /**
     * Log OSC messages sent to scsynth.
     */
    sendosc(text: any): void;
    /**
     * Log OSC messages received from scsynth.
     */
    rcvosc(text: any): void;
    private print;
}
