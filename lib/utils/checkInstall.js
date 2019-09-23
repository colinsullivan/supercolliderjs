"use strict";
/* eslint no-console: 0 */
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var resolveOptions_1 = tslib_1.__importDefault(require("./resolveOptions"));
var fs_1 = tslib_1.__importDefault(require("fs"));
/**
 * Check that scsynth and sclang executables exist.
 *
 * This can be called in a postInstall step for a package
 * to inform the user if it can or cannot find scsynth and sclang.
 *
 * Posts the options to console.
 * Posts errors and any information it can find to help
 * the user.
 */
function checkInstall(checkSclang, checkScsynth) {
    if (checkSclang === void 0) { checkSclang = true; }
    if (checkScsynth === void 0) { checkScsynth = true; }
    console.log("Checking supercollider.js install...");
    resolveOptions_1.default()
        .then(function (options) {
        console.log("Default options:");
        console.log(JSON.stringify(options, null, 2));
        function check(binName) {
            return new Promise(function (resolve, reject) {
                var binPath = options[binName];
                fs_1.default.stat(binPath, function (err) {
                    err ? reject(err) : resolve(binPath);
                });
            });
        }
        var checks = [];
        if (checkSclang) {
            checks.push(check("sclang"));
        }
        if (checkScsynth) {
            checks.push(check("scsynth"));
        }
        // TODO Promise.all short-circuits on failure
        return Promise.all(checks).then(function (paths) {
            console.log("Paths OK: " + paths.join(", "));
        }, function (error) {
            console.error("\nExecutable not found: " + error.path);
            console.error(error);
            console.log("\nInstall SuperCollider if needed: http://supercollider.github.io/download\n" +
                "If you already have it installed but it is in a non-standard location then edit\n" +
                (options.sclang_conf + "\n") +
                "and specify the paths to sclang and scsynth there.\n" +
                "Then run this test again:\n" +
                "npm run check-install\n");
        });
    })
        .catch(console.error);
}
exports.default = checkInstall;
//# sourceMappingURL=checkInstall.js.map