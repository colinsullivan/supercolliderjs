"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var dryadic_1 = require("dryadic");
/**
 * Allocates an audio bus, making it available in the children's context as .out (integer)
 * and .numChannels (integer)
 */
var AudioBus = /** @class */ (function (_super) {
    tslib_1.__extends(AudioBus, _super);
    function AudioBus() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    AudioBus.prototype.defaultProperties = function () {
        return {
            numChannels: 1,
        };
    };
    /**
     * If there is no SCServer in the parent context,
     * then this will wrap itself in an SCServer
     */
    AudioBus.prototype.requireParent = function () {
        return "SCServer";
    };
    AudioBus.prototype.prepareForAdd = function () {
        return {
            callOrder: "SELF_THEN_CHILDREN",
            updateContext: function (context, properties) { return ({
                out: context.scserver.state.allocAudioBus(properties.numChannels),
                numChannels: properties.numChannels,
            }); },
        };
    };
    AudioBus.prototype.remove = function () {
        return {
            run: function (context, properties) {
                return context.scserver.state.freeAudioBus(context.out, properties.numChannels);
            },
        };
    };
    return AudioBus;
}(dryadic_1.Dryad));
exports.default = AudioBus;
//# sourceMappingURL=AudioBus.js.map