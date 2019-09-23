"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/* eslint no-console: 0 */
var path_1 = require("path");
var fs_1 = tslib_1.__importDefault(require("fs"));
var sclang_io_1 = require("../sclang-io");
// parse a series of output files with the option to break into chunks
function readFile(filename) {
    var abs = path_1.join(__dirname, "fixtures", filename);
    return fs_1.default.readFileSync(abs, { encoding: "utf8" });
}
function feedIt(filename, io) {
    io.parse(readFile(filename));
}
describe("sclang-io", function () {
    describe("constructor", function () {
        it("should construct", function () {
            var io = new sclang_io_1.SclangIO();
            expect(io).toBeTruthy();
        });
    });
    describe("setState", function () {
        it("should setState", function () {
            var io = new sclang_io_1.SclangIO();
            io.setState(sclang_io_1.State.BOOTING);
            expect(io.state).toEqual(sclang_io_1.State.BOOTING);
        });
    });
    it("should ignore simple text", function () {
        var io = new sclang_io_1.SclangIO();
        io.setState(sclang_io_1.State.BOOTING);
        feedIt("io-na.txt", io);
        expect(io.state).toEqual(sclang_io_1.State.BOOTING);
    });
    it("should detect succesful compile", function () {
        var io = new sclang_io_1.SclangIO();
        io.setState(sclang_io_1.State.BOOTING);
        feedIt("io-compile-success.txt", io);
        expect(io.state).toEqual(sclang_io_1.State.READY);
    });
    it("should detect succesful compile despite errors in startup", function () {
        var io = new sclang_io_1.SclangIO();
        io.setState(sclang_io_1.State.BOOTING);
        feedIt("errors-but-did-compile.txt", io);
        // its COMPILED but didn't go to READY on sc3>
        expect(io.state).toEqual(sclang_io_1.State.READY);
    });
    it("should detect programmatic compiling", function () {
        var io = new sclang_io_1.SclangIO();
        io.setState(sclang_io_1.State.READY);
        feedIt("io-programmatic-compile.txt", io);
        expect(io.state).toEqual(sclang_io_1.State.COMPILING);
    });
    it("should detect a duplicate class compile failure", function () {
        var io = new sclang_io_1.SclangIO();
        io.setState(sclang_io_1.State.BOOTING);
        feedIt("io-duplicate-class.txt", io);
        expect(io.state).toEqual(sclang_io_1.State.COMPILE_ERROR);
        expect(io.result).toBeDefined();
        expect(io.result.duplicateClasses).toBeDefined();
        expect(io.result.duplicateClasses.length).toEqual(1);
        expect(io.result.duplicateClasses[0].forClass).toEqual("Crucial");
        expect(io.result.duplicateClasses[0].files[0]).toEqual("/Users/crucial/Library/Application Support/SuperCollider/downloaded-quarks/crucial-library/Crucial.sc");
    });
    describe("parseCompileErrors", function () {
        it("should parse Duplicate class errors", function () {
            var io = new sclang_io_1.SclangIO();
            io.setState(sclang_io_1.State.BOOTING);
            var errors = io.parseCompileOutput(readFile("io-duplicate-class.txt"));
            expect(errors).toBeDefined();
            expect(errors.duplicateClasses).toBeDefined();
            expect(errors.duplicateClasses.length).toEqual(1);
            expect(errors.duplicateClasses[0].forClass).toEqual("Crucial");
            expect(errors.duplicateClasses[0].files[0]).toEqual("/Users/crucial/Library/Application Support/SuperCollider/downloaded-quarks/crucial-library/Crucial.sc");
        });
        it("should parse extension for non-existent class", function () {
            var io = new sclang_io_1.SclangIO();
            io.setState(sclang_io_1.State.BOOTING);
            var errors = io.parseCompileOutput(readFile("io-extension-for-non-existent-class.txt"));
            expect(errors).toBeDefined();
            expect(errors.extensionErrors).toBeDefined();
            expect(errors.extensionErrors[0].forClass).toEqual("Document");
            expect(errors.extensionErrors[0].file).toEqual("/deprecated/3.7/deprecated-3.7.sc");
        });
        // other errors:
        // msg file line char
        /*
        it('should parse class syntax error', function() {
          var io = new SclangIO();
          io.setState(State.BOOTING);
          var errors = io.parseCompileOutput(readFile('io-class-syntax-error.txt'));
          console.log(errors);
          expect(errors).toBeDefined;
          expect(errors.extensionErrors).toBeDefined;
          expect(errors.extensionErrors[0].forClass).toEqual('Document');
          expect(errors.extensionErrors[0].file).toEqual('/deprecated/3.7/deprecated-3.7.sc');
        });
    
        it('should parse double class syntax error', function() {
          var io = new SclangIO();
          io.setState(State.BOOTING);
          var errors = io.parseCompileOutput(readFile('io-class-syntax-error-2.txt'));
          console.log(errors);
          expect(errors).toBeDefined;
          expect(errors.extensionErrors).toBeDefined;
          expect(errors.extensionErrors[0].forClass).toEqual('Document');
          expect(errors.extensionErrors[0].file).toEqual('/deprecated/3.7/deprecated-3.7.sc');
        });
        */
    });
    describe("SyntaxErrors", function () {
        it("should parse a SyntaxError from stdout", function () {
            var io = new sclang_io_1.SclangIO();
            io.setState(sclang_io_1.State.READY);
            var text = readFile("trig-not-defined.txt");
            var error = io.parseSyntaxErrors(text);
            expect(error).toBeTruthy();
            expect(error.msg).toBe("Variable 'trig' not defined.");
            expect(error.file).toBe("selected text");
            expect(error.line).toBe(9);
            expect(error.charPos).toBe(47);
        });
        it("on successful interpret, should still post output to stdout", function () {
            var io = new sclang_io_1.SclangIO();
            io.setState(sclang_io_1.State.READY);
            // Stick a blank Promise into register so it will
            // parse the response. Must be the same id as in the fixture.
            io.registerCall("citjy45o00002xpxp9dapi2tt", {
                resolve: function () { },
                reject: function () { },
            });
            return new Promise(function (resolve) {
                // this is what is really being tested:
                // does it post the stuff inside CAPTURE
                // ERROR: Quarks-install: path does not exist /Users/crucial/wrong
                // to STDOUT ?
                io.on("stdout", function (out) {
                    console.log("test STDOUT", out);
                    resolve(true);
                });
                io.parse(readFile("forward-stdout.txt"));
            });
        });
    });
    describe("capture", function () {
        it("should capture any immediate postln from end of CAPTURE", function () {
            var io = new sclang_io_1.SclangIO();
            io.setState(sclang_io_1.State.READY);
            var output = [];
            io.on("stdout", function (o) { return output.push(o); });
            feedIt("routine-postln.txt", io);
            // should have emited stdout with 'hi'
            expect(output.length > 0).toBeTruthy();
            expect(output[0].match(/hi/)).toBeTruthy();
        });
    });
});
//# sourceMappingURL=sclang-io-test.js.map