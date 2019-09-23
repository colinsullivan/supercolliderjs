"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = tslib_1.__importDefault(require("lodash"));
var resolveOptions_1 = tslib_1.__importDefault(require("../resolveOptions"));
describe("resolveOptions", function () {
    // `pit` is `it` for promises
    it("should get default options with no undefines", function () {
        return resolveOptions_1.default().then(function (opts) {
            lodash_1.default.each(opts, function (val) {
                expect(val).toBeDefined();
            });
        });
    });
    it("should reject if configPath does not exist", function () {
        var badPath = "/---~no-way-do-you-have-this-path-on-your-computer~---/bad/path.yaml";
        return resolveOptions_1.default(badPath, {}).then(function () {
            throw new Error("should not have resolved");
        }, function (err) {
            expect(err.message).toBeTruthy();
            expect(err.message).toContain(badPath);
        });
    });
    it("should remove undefined values from supplied options", function () {
        return resolveOptions_1.default(null, { sclang: undefined }).then(function (opts) {
            lodash_1.default.each(opts, function (val) {
                expect(val).toBeDefined();
            });
        });
    });
});
//# sourceMappingURL=resolve-options-test.js.map