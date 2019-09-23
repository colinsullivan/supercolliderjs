"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = tslib_1.__importDefault(require("lodash"));
var OSCSched_1 = tslib_1.__importDefault(require("../OSCSched"));
describe("OSCSched", function () {
    var sched, sent, didClearTimeout, didSetTimeout;
    var timeoutId = 1;
    beforeEach(function () {
        sent = null;
        didClearTimeout = false;
        didSetTimeout = false;
        sched = new OSCSched_1.default(function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            sent = args;
        }, 0.05, function (fn /*, delta*/) {
            fn();
            didSetTimeout = true;
            return timeoutId;
        }, function (tid) {
            didClearTimeout = tid;
        });
    });
    var schedOne = function (time) {
        sched.schedLoop(function (now, memo) {
            if (memo === void 0) { memo = { i: 0 }; }
            if (memo.i === 0) {
                return {
                    event: {
                        time: time,
                        msgs: [],
                    },
                    memo: { i: memo.i + 1 },
                };
            }
            return undefined;
        }, lodash_1.default.now());
    };
    describe("empty sched", function () {
        it("should not have sent nothing", function () {
            sched.schedLoop(function () {
                return undefined;
            }, lodash_1.default.now());
            expect(sent).toBe(null);
        });
        it("should not have set timeout", function () {
            sched.schedLoop(function () {
                return undefined;
            }, lodash_1.default.now());
            expect(didSetTimeout).toBe(false);
        });
    });
    describe("sched at 1", function () {
        it("should have set timeout", function () {
            schedOne(1);
            expect(didSetTimeout).toBe(true);
        });
    });
    describe("sched less than latency", function () {
        it("should have called send right away", function () {
            schedOne(0.01);
            expect(didSetTimeout).toBe(false);
            expect(sent).toBeTruthy();
        });
    });
    describe("sched twice", function () {
        it("should have cleared timeout", function () {
            schedOne(1);
            schedOne(0.5);
            expect(didClearTimeout).toBe(timeoutId);
        });
    });
});
//# sourceMappingURL=OSCSched.spec.js.map