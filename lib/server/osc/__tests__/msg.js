"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var msg = tslib_1.__importStar(require("../msg"));
var lodash_1 = tslib_1.__importDefault(require("lodash"));
// import { CallAndResponse } from "Types";
describe("msg", function () {
    it("should evaluate each one without error", function () {
        lodash_1.default.each(msg, function (value) {
            // if (typeof value === 'function') {
            // var result = value();
            // if (_.isArray(result)) {
            //   expect(_.isArray(result)).toBeTruthy();
            // } else if (_.isObject(result)) {
            //   let r = result as CallAndResponse;
            //   expect(r.call).toBeDefined();
            //   expect(r.response).toBeDefined();
            // } else {
            //   fail("wrong type:" + result);
            // }
            // }
        });
    });
});
//# sourceMappingURL=msg.js.map