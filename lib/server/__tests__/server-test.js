"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = tslib_1.__importDefault(require("lodash"));
var events_1 = require("events");
var server_1 = tslib_1.__importDefault(require("../server"));
describe("Server", function () {
    describe("default constructor", function () {
        it("should exist", function () {
            var server = new server_1.default();
            expect(server).toBeDefined();
        });
    });
    describe("boot sequence", function () {
        it('should detect "server ready" even if the output is broken into chunks', function () {
            var one = "SuperCollider 3 se";
            var two = "rver ready.";
            var server = new server_1.default();
            spyOn(server, "_spawnProcess").and.returnValue(null);
            // make a fake this.process.stdout / stderr
            server.process = {
                stdout: new events_1.EventEmitter(),
                stderr: new events_1.EventEmitter(),
            };
            return new Promise(function (resolve) {
                // spawn process is mocked
                // should get triggered by the stdout and then resolve
                server.boot().then(resolve);
                server.process.stdout.emit("data", one);
                server.process.stdout.emit("data", two);
            });
        });
    });
    describe("oscOnce", function () {
        it("should fullfill", function () {
            var s = new server_1.default();
            var spy = jest.spyOn(s.send, "msg");
            spy.mockImplementation(function () { return null; });
            var p = s.oscOnce(["/done", "/notify"]).then(function (rest) {
                // p is now fulfilled
                // console.log(rest);
                expect(lodash_1.default.isEqual(rest, [15])).toBe(true);
            });
            expect(spy).toHaveBeenCalledTimes(0);
            //  s.send.msg.mock.calls.length).toBe(0);
            // server responds
            s.receive.onNext(["/done", "/notify", 15]);
            return p;
        });
        it("should reject if server is not booted", function () {
            // this would be send that rejects it
            // do this later when you implement that
        });
        it("should reject if send fails", function () {
            // s.send.msg.mockReturnValueOnce
        });
        // server could respond with command not recognized
    });
    describe("callAndResponse", function () {
        it("should call and get response", function () {
            var s = new server_1.default();
            var car = {
                call: ["/notify"],
                response: ["/done", "/notify"],
            };
            s.send.msg = jest.fn();
            var spy = jest.spyOn(s.send, "msg");
            spy.mockImplementation(function () { return null; });
            var p = s.callAndResponse(car).then(function (response) {
                expect(lodash_1.default.isEqual(response, [15])).toBe(true);
            });
            // console.log('sender', s.send);
            expect(spy).toHaveBeenCalledTimes(1);
            // server responds
            s.receive.onNext(["/done", "/notify", 15]);
            return p;
        });
    });
    describe("args", function () {
        it("should work with empty options", function () {
            var s = new server_1.default();
            var a = s.args();
            expect(lodash_1.default.isArray(a)).toBeTruthy();
        });
        it("should pass loadDefs as -D if false", function () {
            var s = new server_1.default({ loadDefs: false });
            var a = s.args();
            expect(a.find(function (v) { return v === "-D"; })).toBeTruthy();
        });
        it("would not include -D if loadDefs is the default true", function () {
            var s = new server_1.default({ loadDefs: true });
            var a = s.args();
            expect(a.find(function (v) { return v === "-D"; })).toBeFalsy();
        });
        it("would include device as -H", function () {
            var device = "Soundflower (2ch)";
            var s = new server_1.default({ device: device });
            var a = s.args();
            expect(a.find(function (v) { return v === "-H"; })).toBeTruthy();
            expect(a.find(function (v) { return v === device; })).toBeTruthy();
        });
    });
});
//# sourceMappingURL=server-test.js.map