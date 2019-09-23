"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var dryadic_1 = require("dryadic");
var lodash_1 = tslib_1.__importDefault(require("lodash"));
var server_1 = require("../server/server");
var defaultOptions = {
    debug: false,
};
/**
 * Boots a new SuperCollider server (scsynth) making it available for all children as `context.scserver`
 *
 * Always boots a new one, ignoring any possibly already existing one in the parent context.
 *
 * `options` are the command line options supplied to scsynth (note: not all options are passed through yet)
 * see {@link Server}
 */
var SCServer = /** @class */ (function (_super) {
    tslib_1.__extends(SCServer, _super);
    function SCServer() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SCServer.prototype.defaultProperties = function () {
        return {
            options: defaultOptions,
        };
    };
    SCServer.prototype.initialContext = function () {
        return {
            out: 0,
            group: 0,
        };
    };
    SCServer.prototype.prepareForAdd = function () {
        return {
            callOrder: "SELF_THEN_CHILDREN",
            updateContext: function (context, properties) { return ({
                scserver: server_1.boot(lodash_1.default.defaults(properties.options, { log: context.log })),
            }); },
        };
    };
    SCServer.prototype.remove = function () {
        return {
            run: function (context) {
                if (context.scserver) {
                    return context.scserver.quit();
                }
            },
        };
    };
    return SCServer;
}(dryadic_1.Dryad));
exports.default = SCServer;
//# sourceMappingURL=SCServer.js.map