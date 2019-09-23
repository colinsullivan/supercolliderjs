"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var baconjs_1 = require("baconjs");
var lodash_1 = tslib_1.__importDefault(require("lodash"));
var server_1 = tslib_1.__importDefault(require("../../server/server"));
var SynthStream_1 = tslib_1.__importDefault(require("../SynthStream"));
describe("SynthStream", function () {
    var stream = new baconjs_1.Bus();
    var properties = {
        stream: stream,
    };
    var ss = new SynthStream_1.default(properties);
    it("should construct", function () {
        expect(ss).toBeTruthy();
    });
    describe("commandsForEvent", function () {
        it("has 1 message with no event.id supplied", function () {
            var event = {
                type: "noteOn",
                defName: "sin",
                args: {},
            };
            var context = {
                id: "ss",
                scserver: new server_1.default(),
            };
            // cannot read state  of undefined
            var cmds = ss.commandsForEvent(event, context, properties);
            expect(cmds.scserver.bundle.packets.length).toBe(1);
        });
        it("noteOn with event.key should updateContext and s_new", function () {
            var event = {
                type: "noteOn",
                defName: "sin",
                key: 1,
            };
            var context = {
                id: "ss",
                scserver: new server_1.default(),
            };
            var cmds = ss.commandsForEvent(event, context, properties);
            expect(cmds.updateContext).toBeTruthy();
            // assumes that Server nextNode returned 1000
            expect(cmds.scserver.bundle.packets).toEqual([["/s_new", "sin", 1000, 1, 0, "out", 0]]);
        });
        it("noteOff with event.key should updateContext and s_", function () {
            var noteOn = {
                type: "noteOn",
                defName: "sin",
                key: 1,
            };
            var noteOff = {
                type: "noteOff",
                defName: "sin",
                key: 1,
            };
            var context = {
                id: "ss",
                scserver: new server_1.default(),
            };
            // call noteOn and update the context
            var cmds = ss.commandsForEvent(noteOn, context, properties);
            lodash_1.default.assign(context, cmds.updateContext);
            // now call noteOff
            var cmds2 = ss.commandsForEvent(noteOff, context, properties);
            expect(cmds2.updateContext).toBeTruthy();
            // assumes that Server nextNode returned 1000
            expect(cmds2.scserver.bundle.packets).toEqual([["/n_free", 1000]]);
        });
        // no defName in event or default should not return anything
    });
});
//# sourceMappingURL=SynthStream.spec.js.map