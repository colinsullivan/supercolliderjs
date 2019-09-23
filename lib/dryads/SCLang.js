"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var dryadic_1 = require("dryadic");
var lodash_1 = tslib_1.__importDefault(require("lodash"));
var sclang_1 = require("../lang/sclang");
var defaultOptions = {
    debug: true,
    echo: false,
    stdin: false,
};
/**
 * Boots a new SuperCollider language interpreter (sclang) making it available for all children as context.sclang
 *
 * Always boots a new one, ignoring any possibly already existing one in the parent context.
 *
 * `options` are the command line options supplied to sclang (note: not all options are passed through yet)
 * see {@link lang/SCLang}
 *
 * Not to be confused with the other class named SCLang which does all the hard work.
 * This Dryad class is just a simple wrapper around that.
 */
var SCLang = /** @class */ (function (_super) {
    tslib_1.__extends(SCLang, _super);
    function SCLang() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    SCLang.prototype.defaultProperties = function () {
        return {
            options: defaultOptions,
        };
    };
    SCLang.prototype.prepareForAdd = function () {
        return {
            callOrder: "SELF_THEN_CHILDREN",
            updateContext: function (context, properties) { return ({
                sclang: sclang_1.boot(lodash_1.default.defaults(properties.options, { log: context.log })),
            }); },
        };
    };
    SCLang.prototype.remove = function () {
        return {
            run: function (context) {
                return context.sclang && context.sclang.quit();
            },
        };
    };
    return SCLang;
}(dryadic_1.Dryad));
exports.default = SCLang;
//# sourceMappingURL=SCLang.js.map