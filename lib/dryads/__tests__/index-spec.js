"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var dryads = tslib_1.__importStar(require("../index"));
var SCServer_1 = tslib_1.__importDefault(require("../SCServer"));
describe("SCServer", function () {
    it("should load SCServer", function () {
        expect(dryads.SCServer).toBeTruthy();
    });
    it("should set default options of SCServer", function () {
        var s = new SCServer_1.default();
        expect(s.properties).toEqual({ options: { debug: false } });
    });
    // it('should pass context.scserver to child Group', function() {
    //   // mock import {boot} from '../server/server';
    //
    //   let g = new dryads.Group();
    //   let s = new dryads.SCSynth({}, [g]);
    //   // because scsynth was set during prepare
    //   // it was not available during initial construction of contexts
    //   // how to just call this ?
    //   // s.prepareForAdd()
    //   // dryadic(s).play()
    // });
});
// describe('Group', function() {
//   it('should pass .group to child', function() {
//     let g = new dryads.Group();
//     let h = new dryads.Group([g]);
//
//     // prepareForAdd invokes a lot of things to get that nodeID
//     // h.tree();
//   });
// });
// should test that:
// - all prepares are functions
// - all add and remove return commands that are registered in a layer
// - make a validator
//# sourceMappingURL=index-spec.js.map