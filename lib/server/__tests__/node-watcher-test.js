"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var lodash_1 = tslib_1.__importDefault(require("lodash"));
var server_1 = tslib_1.__importDefault(require("../server"));
var nw = tslib_1.__importStar(require("../node-watcher"));
describe("node-watcher", function () {
    var nodeID = 1000;
    var id = "0.1.2";
    var id2 = "0.1.3";
    function expectEqualState(s, object) {
        var cs = s.state.getIn(["NODE_WATCHER"]).toJS();
        var is = lodash_1.default.isEqual(cs, object);
        if (!is) {
            // as long as callbacks have the same keys list
            // the functions were copied and aren't the same ones now
            // which is annoying in itself
            if (!lodash_1.default.isEqual(cs["ON_NODE_GO"], object["ON_NODE_GO"])) {
                expect(cs).toEqual(object);
            }
            if (!lodash_1.default.isEqual(lodash_1.default.keys(cs["CALLBACKS"]), lodash_1.default.keys(object["CALLBACKS"]))) {
                expect(cs).toEqual(object);
            }
        }
    }
    describe("onNodeGo", function () {
        it("should register a callback", function () {
            function fn() { }
            var s = new server_1.default();
            nw.onNodeGo(s, id, nodeID, fn);
            expectEqualState(s, {
                ON_NODE_GO: {
                    "1000": ["0.1.2:1000"]
                },
                CALLBACKS: {
                    "0.1.2:1000": fn
                }
            });
        });
        it("should add another callback on same node", function () {
            function fn() { }
            var s = new server_1.default();
            nw.onNodeGo(s, id, nodeID, fn);
            nw.onNodeGo(s, id2, nodeID, fn);
            expectEqualState(s, {
                ON_NODE_GO: {
                    "1000": ["0.1.2:1000", "0.1.3:1000"]
                },
                CALLBACKS: {
                    "0.1.2:1000": fn,
                    "0.1.3:1000": fn
                }
            });
        });
        it("should dispose of callback", function () {
            function fn() { }
            var s = new server_1.default();
            var dispose = nw.onNodeGo(s, id, nodeID, fn);
            expect(dispose).toBeTruthy();
            dispose();
            expectEqualState(s, {
                ON_NODE_GO: {
                    "1000": []
                },
                CALLBACKS: {}
            });
        });
    });
    describe("watchNodeNotifications", function () {
        it("should fire a onNodeGo handler when server receives", function () {
            var s = new server_1.default();
            return new Promise(function (resolve) {
                nw.onNodeGo(s, id, nodeID, function (nid) {
                    expect(nid).toBe(nodeID);
                    resolve();
                });
                s.receive.onNext(["/n_go", nodeID, 0, -1, 3, 0]);
            });
        });
    });
});
//# sourceMappingURL=node-watcher-test.js.map