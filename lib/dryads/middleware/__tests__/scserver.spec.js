"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var scserver_1 = tslib_1.__importDefault(require("../scserver"));
/**
 * mock context.scserver.send.bundle
 *  context.scserver.callAndResponse
 */
describe("scserver", function () {
    // TODO use real objects
    var context = {
        scserver: {
            callAndResponse: jest.fn(),
            send: {
                bundle: jest.fn(),
            },
        },
    };
    var properties = {};
    describe("msg", function () {
        it("should send msg", function () {
            var cmd = {
                scserver: {
                    msg: ["/s_new", "sin", 1000, 0, 1],
                },
            };
            scserver_1.default(cmd, context, properties);
            expect(context.scserver.send.bundle).toHaveBeenCalled();
        });
    });
});
//# sourceMappingURL=scserver.spec.js.map