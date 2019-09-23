"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * @module dryads
 */
var scserver_1 = tslib_1.__importDefault(require("./middleware/scserver"));
var SCServer_1 = tslib_1.__importDefault(require("./SCServer"));
exports.SCServer = SCServer_1.default;
var SCLang_1 = tslib_1.__importDefault(require("./SCLang"));
exports.SCLang = SCLang_1.default;
var Group_1 = tslib_1.__importDefault(require("./Group"));
exports.Group = Group_1.default;
var Synth_1 = tslib_1.__importDefault(require("./Synth"));
exports.Synth = Synth_1.default;
var AudioBus_1 = tslib_1.__importDefault(require("./AudioBus"));
exports.AudioBus = AudioBus_1.default;
var SCSynthDef_1 = tslib_1.__importDefault(require("./SCSynthDef"));
exports.SCSynthDef = SCSynthDef_1.default;
var SynthControl_1 = tslib_1.__importDefault(require("./SynthControl"));
exports.SynthControl = SynthControl_1.default;
var SynthStream_1 = tslib_1.__importDefault(require("./SynthStream"));
exports.SynthStream = SynthStream_1.default;
var SynthEventList_1 = tslib_1.__importDefault(require("./SynthEventList"));
exports.SynthEventList = SynthEventList_1.default;
// confusing to swap the names like this
var dryadic_1 = require("dryadic");
var middleware = [scserver_1.default];
var classes = [SCServer_1.default, SCLang_1.default, Group_1.default, Synth_1.default, AudioBus_1.default, SCSynthDef_1.default, SynthControl_1.default, SynthStream_1.default, SynthEventList_1.default];
exports.layer = {
    middleware: middleware,
    classes: classes,
};
/**
 * Create a DryadPlayer from a Dryad or hyperscript definition.
 *
 * Automatically includes the supercollider.js layer
 *
 * usage:
 *
 *   var sc = require('supercolliderjs');
 *   var player = sc.dryadic([
 *     'scserver', [
 *       ['group', [
 *         ['synth', {
 *           defName: 'sinosc',
 *           args: {
 *             freq: 440
 *           }
 *         }]
 *       ]
 *   ]);
 *   player.play();
 *   ...
 *   player.stop();
 */
function dryadic(rootDryad, moreLayers, rootContext) {
    if (moreLayers === void 0) { moreLayers = []; }
    if (rootContext === void 0) { rootContext = {}; }
    return dryadic_1.dryadic(rootDryad, [exports.layer].concat(moreLayers), rootContext);
}
exports.dryadic = dryadic;
/**
 * Play a Dryad or hyperscript document.
 *
 * usage:
 *
 *   var sc = require('supercolliderjs');
 *   var player = sc.play([
 *     'scserver', [
 *       ['group', [
 *         ['synth', {
 *           defName: 'sinosc',
 *           args: {
 *             freq: 440
 *           }
 *         }]
 *       ]
 *   ]);
 *
 * @param {Dryad|Array} rootDryad - Dryad object or hyperscript document
 * @returns {DryadPlayer}
 */
function play(rootDryad) {
    return dryadic(rootDryad).play();
}
exports.play = play;
/**
 * Convert hyperscript object to a tree of Dryads.
 *
 * This lookups each class by lower class 'classname'
 * and creates an instance with properties and children.
 */
function h(hgraph) {
    var player = dryadic();
    return player.h(hgraph);
}
exports.h = h;
//# sourceMappingURL=index.js.map