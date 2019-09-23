"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var events_1 = require("events");
var fs_1 = tslib_1.__importDefault(require("fs"));
var lodash_1 = tslib_1.__importDefault(require("lodash"));
var path_1 = tslib_1.__importDefault(require("path"));
var sclang_1 = tslib_1.__importDefault(require("../sclang"));
// import {State} from '../internals/sclang-io';
var MockProcess = /** @class */ (function (_super) {
    tslib_1.__extends(MockProcess, _super);
    function MockProcess() {
        var _this = _super.call(this) || this;
        _this.stdout = new events_1.EventEmitter();
        _this.stderr = new events_1.EventEmitter();
        return _this;
    }
    MockProcess.prototype.kill = function () { };
    return MockProcess;
}(events_1.EventEmitter));
describe("sclang", function () {
    describe("default constructor", function () {
        it("should exist", function () {
            var sclang = new sclang_1.default();
            expect(sclang).toBeDefined();
        });
    });
    describe("sclangConfigOptions", function () {
        it("should include supercollider-js", function () {
            var sclang = new sclang_1.default();
            var opts = sclang.sclangConfigOptions(sclang.options);
            expect(opts.includePaths.length).toEqual(1);
            var isIn = lodash_1.default.some(opts.includePaths, function (p) {
                // and that directory should really exist
                return p.match(/supercollider-js$/) && fs_1.default.statSync(p);
            });
            expect(isIn).toBeTruthy();
        });
        it("should read a supplied sclang_conf", function () {
            var sclang = new sclang_1.default({
                sclang_conf: path_1.default.join(__dirname, "fixtures", "sclang_test_conf.yaml"),
            });
            var opts = sclang.sclangConfigOptions(sclang.options);
            // as well as supercollider-js
            expect(opts.includePaths.length).toEqual(2 + 1);
            expect(opts.excludePaths.length).toEqual(1);
        });
        it("should merge sclang_conf with supplied includePaths", function () {
            var sclang = new sclang_1.default({
                sclang_conf: path_1.default.join(__dirname, "fixtures", "sclang_test_conf.yaml"),
                conf: {
                    includePaths: ["/custom/one", "/path/include/one"],
                    excludePaths: ["/custom/two"],
                    postInlineWarnings: true,
                },
            });
            var opts = sclang.sclangConfigOptions(sclang.options);
            expect(opts.includePaths.length).toEqual(3 + 1);
            expect(opts.excludePaths.length).toEqual(2);
        });
    });
    describe("args", function () {
        it("should format args correctly", function () {
            var sclang = new sclang_1.default();
            var args = sclang.args({ langPort: 4 });
            // [ '-i', 'supercolliderjs', '-u', '4' ]
            expect(args.length).toEqual(4);
            expect(args[3]).toEqual("4");
        });
    });
    describe("boot", function () {
        it("should call spawnProcess", function () {
            var sclang = new sclang_1.default();
            var SPAWNED = "SPAWNED";
            spyOn(sclang, "spawnProcess").and.returnValue(SPAWNED);
            return sclang
                .boot()
                .then(function (result) { return expect(result).toEqual(SPAWNED); })
                .catch(function (err) {
                throw err;
            });
        });
    });
    describe("makeSclangConfig", function () {
        it("should write a yaml file and resolve with a path", function () {
            var sclang = new sclang_1.default({ conf: { includePaths: [], excludePaths: [], postInlineWarnings: false } });
            return sclang
                .makeSclangConfig(sclang.options.conf)
                .then(function (tmpPath) { return expect(tmpPath).toBeTruthy(); })
                .catch(function (err) {
                throw err;
            });
        });
    });
    describe("sclangConfigOptions", function () {
        it("should include supercollider-js", function () {
            var sclang = new sclang_1.default();
            var config = sclang.sclangConfigOptions(sclang.options);
            expect(config.includePaths.length).toEqual(1);
            expect(config.includePaths[0].match(/supercollider-js/)).toBeTruthy();
        });
        // not really possible now
        it("postInlineWarning should not be undefined", function () {
            var sclang = new sclang_1.default();
            var config = sclang.sclangConfigOptions(sclang.options);
            expect(config.postInlineWarnings).toBeDefined();
        });
    });
    describe("makeStateWatcher", function () {
        it("should echo events from SclangIO to SCLang", function () {
            var sclang = new sclang_1.default();
            var did = false;
            var stateWatcher = sclang.makeStateWatcher();
            sclang.on("state", function () {
                did = true;
            });
            stateWatcher.emit("state", "READY");
            expect(did).toEqual(true);
        });
    });
    describe("installListeners", function () {
        it("should install event listeners", function () {
            var subprocess = new MockProcess();
            var sclang = new sclang_1.default();
            // don't listen to stdin or tests will hang
            sclang.installListeners(subprocess, false);
        });
        // the test runner jest-cli is getting these and breaking
        // it('should respond to subprocess events', function() {
        //   /**
        //    * TODO needs to be properly mocked
        //    */
        //   var subprocess = new MockProcess();
        //   var sclang = new SCLang();
        //   sclang.setState(State.BOOTING);
        //   sclang.installListeners(subprocess, true);
        //
        //   process.stdin.emit('data', '');
        //   subprocess.stdout.emit('data', 'data');
        //   subprocess.stderr.emit('data', 'data');
        //   subprocess.emit('error', 'error');
        //   subprocess.emit('close', 0, 'close');
        //   subprocess.emit('exit', 0, 'exit');
        //   subprocess.emit('disconnect');
        // });
    });
    describe("spawnProcess", function () {
        // mock spawn to return an event emitter
        it("should spawnProcess", function () {
            var sclang = new sclang_1.default();
            spyOn(sclang, "_spawnProcess").and.returnValue({
                pid: 1,
            });
            spyOn(sclang, "installListeners");
            var promise = sclang.spawnProcess("/tmp/fake/path", {});
            expect(promise).toBeTruthy();
        });
    });
    describe("interpret", function () {
        it("should call this.write", function () {
            var sclang = new sclang_1.default();
            spyOn(sclang, "write").and.returnValue(null);
            sclang.interpret("1 + 1", "/tmp/source.scd");
            expect(sclang.write).toHaveBeenCalled();
        });
    });
    describe("executeFile", function () {
        it("should call this.write", function () {
            var sclang = new sclang_1.default();
            spyOn(sclang, "write").and.returnValue(null);
            sclang.executeFile("/tmp/source.scd");
            expect(sclang.write).toHaveBeenCalled();
        });
    });
    describe("quit", function () {
        it("should quit silently if not booted", function () {
            var sclang = new sclang_1.default();
            return sclang.quit();
        });
        it("should quit process", function () {
            var sclang = new sclang_1.default();
            var process = new MockProcess();
            sclang.process = process;
            spyOn(sclang.process, "kill").and.returnValue(null);
            var p = sclang.quit().then(function () {
                expect(sclang.process).toEqual(undefined);
            });
            sclang.process.emit("exit");
            return p;
        });
    });
});
//# sourceMappingURL=sclang-test.js.map