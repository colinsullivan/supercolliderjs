"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var Synth_1 = tslib_1.__importDefault(require("../Synth"));
var dryadic_1 = require("dryadic");
var test_utils_1 = require("../utils/test-utils");
describe("Synth", function () {
    describe("simple", function () {
        var s = new Synth_1.default({
            def: "saw",
            args: {
                freq: 440,
            },
        });
        it("should compile", function () {
            expect(s);
        });
        it("should make playgraph", function () {
            // JSON type doesn't handle mixed arrays yet
            var h = ["SCServer", { options: { debug: false } }, [["Synth", { def: "saw", args: { freq: 440 } }, []]]];
            test_utils_1.expectPlayGraphToEqual(s, h);
        });
        // it('should return command add', function() {
        //   let p = makePlayer(s);
        //   // Synth is first child
        //   let cmd = getCommand(p, 'add', [0]);
        //   // Didn't call prepare so context.nodeID is undefined
        //   let m = ['/s_new', 'saw', undefined, 1, 0, 'freq', 440];
        //   expect(cmd.commands.scserver.msg).toEqual(m);
        // });
    });
    describe("Synth", function () {
        describe("with properties", function () {
            var FakeDef = /** @class */ (function (_super) {
                tslib_1.__extends(FakeDef, _super);
                function FakeDef() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.name = "fake-saw";
                    return _this;
                }
                FakeDef.prototype.value = function () {
                    return this.name;
                };
                return FakeDef;
            }(dryadic_1.Dryad));
            var FakeSlider = /** @class */ (function (_super) {
                tslib_1.__extends(FakeSlider, _super);
                function FakeSlider() {
                    return _super !== null && _super.apply(this, arguments) || this;
                }
                FakeSlider.prototype.value = function () {
                    return 440;
                };
                return FakeSlider;
            }(dryadic_1.Dryad));
            var s = new Synth_1.default({
                def: new FakeDef(),
                args: {
                    freq: new FakeSlider(),
                },
            });
            it("should compile", function () {
                expect(s);
            });
            it("should make playgraph", function () {
                var h = [
                    "SCServer",
                    {
                        options: {
                            debug: false,
                        },
                    },
                    [
                        [
                            "Properties",
                            {},
                            [
                                ["FakeDef", {}, []],
                                ["FakeSlider", {}, []],
                                [
                                    "PropertiesOwner",
                                    {},
                                    [
                                        [
                                            "Synth",
                                            {
                                                args: {
                                                    freq: function () { },
                                                },
                                                def: function () { },
                                            },
                                            [],
                                        ],
                                    ],
                                ],
                            ],
                        ],
                    ],
                ];
                // Ignore the property accessor functions when comparing
                test_utils_1.expectPlayGraphToEqual(s, h, function (g) {
                    // console.log(JSON.stringify(g, null, 2));
                    var propOwner = g[2][0][2][2];
                    // console.log('propOwner', propOwner);
                    var synth = propOwner[2][0];
                    // console.log('synth', synth);
                    synth[1].args.freq = undefined;
                    synth[1].def = undefined;
                });
            });
            // it('should return command add', function() {
            //   /**
            //    * The required parent is SCServer which needs to be mocked
            //    * otherwise it would try to boot.
            //    */
            //   let p = makePlayer(s);
            //   // have to call prepare for add or the context isn't loaded
            //   // with the propertyValues.
            //   // unless you do that again for .add
            //   let synthCmd = getCommand(p, 'add', [0, 2, 0]);
            //
            //   // Didn't call prepare so context.nodeID is undefined
            //   let m = ['/s_new', 'fake-saw', undefined, 1, 0, 'freq', 440];
            //   console.log('synthCmd', JSON.stringify(synthCmd, null, 2));
            //   //       {"commands":{},"context":{"id":"0.0.props.2","log":{"_buffer":[]}},"properties":{"indices":{"def":0,"args":{"freq":1}}},"id":"0.0.props.2","children":[{"commands":{"scserver":{}},"context":{"id":"0.0.props.2.0","log":{"_buffer":[]}},"properties":{"args":{}},"id":"0.0.props.2.0","children":[]}]}
            //   expect(synthCmd.commands.scserver.msg).toEqual(m);
            // });
        });
    });
});
//# sourceMappingURL=Synth.spec.js.map