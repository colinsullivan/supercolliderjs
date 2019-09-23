"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
// http://www.2ality.com/2011/12/subtyping-builtins.html
function copyOwnFrom(target, source) {
    Object.getOwnPropertyNames(source).forEach(function (propName) {
        var prop = Object.getOwnPropertyDescriptor(source, propName);
        if (prop !== undefined) {
            Object.defineProperty(target, propName, prop);
        }
    });
    return target;
}
var ExtendableError = /** @class */ (function () {
    function ExtendableError(message) {
        this.message = "";
        this.stack = "";
        var superInstance = new Error(message);
        copyOwnFrom(this, superInstance);
        if (typeof Error.captureStackTrace === "function") {
            Error.captureStackTrace(this, this.constructor);
        }
        else {
            if (superInstance.stack !== undefined) {
                this.stack = superInstance.stack;
            }
        }
    }
    return ExtendableError;
}());
/**
 * A custom error class that adds a data field for passing structured error data.
 */
var SCError = /** @class */ (function (_super) {
    tslib_1.__extends(SCError, _super);
    function SCError(message, data) {
        var _this = _super.call(this, message) || this;
        _this.data = data;
        return _this;
    }
    /**
     * Update message and data with additional information.
     * Used when passing the error along but when you want
     * to add additional contextual debugging information.
     */
    SCError.prototype.annotate = function (message, data) {
        this.message = message;
        this.data = tslib_1.__assign({}, this.data, data);
    };
    return SCError;
}(ExtendableError));
exports.SCError = SCError;
/**
 * SCLangError - syntax errors while interpreting code, interpret code execution errors, and asynchronous errors.
 *
 * @param type - SyntaxError | Error : Tells which format the error object will be in.
 * @param error - The error data object
 *               An Error will have a stack trace and all of the fields of the sclang error
 *               that it is generated from.
 *               SyntaxError is created by parsing the posted output of sclang.
 *
 * See SuperColliderJS-encodeError
 *
 * @param data - optional additional debug information supplied from supercollider.js
 */
var SCLangError = /** @class */ (function (_super) {
    tslib_1.__extends(SCLangError, _super);
    function SCLangError(message, type, error, data) {
        if (data === void 0) { data = {}; }
        var _this = _super.call(this, message, data) || this;
        _this.type = type;
        _this.error = error;
        _this.data = data;
        return _this;
    }
    return SCLangError;
}(SCError));
exports.SCLangError = SCLangError;
//# sourceMappingURL=Errors.js.map