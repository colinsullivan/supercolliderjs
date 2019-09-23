"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * Default configs for scsynth and sclang
 *
 * Looks for '.supercollider.yaml' starting from current working directory.
 *
 * Matching config files in child directories are shallow merged into config files found in parent directories. So a local project's .supercollider.yaml can inherit from a ~/.supercollider.yaml
 */
var fs_1 = tslib_1.__importDefault(require("fs"));
var js_yaml_1 = tslib_1.__importDefault(require("js-yaml"));
var lodash_1 = tslib_1.__importDefault(require("lodash"));
var os_1 = tslib_1.__importDefault(require("os"));
var path_1 = tslib_1.__importDefault(require("path"));
var untildify_1 = tslib_1.__importDefault(require("untildify"));
var Errors_1 = require("../Errors");
var options_1 = require("../server/options");
function getUserHome() {
    var home = process.env.HOME || process.env.HOMEPATH || process.env.USERPROFILE;
    if (!home) {
        throw new Error("Failed to find user home directory");
    }
    return home;
}
function defaultOptions() {
    // should get this from server/default-server-options.json
    var opts = tslib_1.__assign({ debug: false, echo: true, 
        // stdin: true,
        websocketPort: 4040 }, options_1.defaults);
    var defaultRoot;
    switch (os_1.default.platform()) {
        case "win32":
            defaultRoot = "C:\\Program Files (x86)\\SuperCollider";
            opts.sclang = path_1.default.join(defaultRoot, "sclang.exe");
            opts.scsynth = path_1.default.join(defaultRoot, "scsynth.exe");
            opts.sclang_conf = path_1.default.join(defaultRoot, "sclang_conf.yaml");
            break;
        case "darwin":
            opts.sclang = "/Applications/SuperCollider/SuperCollider.app/Contents/MacOS/sclang";
            opts.scsynth = "/Applications/SuperCollider/SuperCollider.app/Contents/Resources/scsynth";
            opts.sclang_conf = getUserHome() + "/Library/Application Support/SuperCollider/sclang_conf.yaml";
            break;
        default:
            defaultRoot = "/usr/local/bin";
            opts.sclang = path_1.default.join(defaultRoot, "sclang");
            opts.scsynth = path_1.default.join(defaultRoot, "scsynth");
            opts.sclang_conf = "/usr/local/share/SuperCollider/sclang_conf.yaml";
    }
    return opts;
}
function filterUndefs(opts) {
    var cleaned = {};
    lodash_1.default.each(opts, function (value, key) {
        if (!lodash_1.default.isUndefined(value)) {
            cleaned[key] = value;
        }
    });
    return cleaned;
}
/**
 * load configuration files
 * and merge options into a final dict
 *
 * @param {String} configPath - explicit path to a yaml config file
 *           otherwise tries
 *             .supercollider.yaml
 *             ~/.supercollider.yaml
 *
 * @param {object} commandLineOptions -
 *            a dict of options to be merged over the loaded config.
 *            eg. supplied command line options --sclang=/some/path/to/sclang
 *
 */
function resolveOptions(configPath, commandLineOptions) {
    return new Promise(function (resolve, reject) {
        function ok(opts, aPath) {
            var options = lodash_1.default.extend(defaultOptions(), filterUndefs(opts), filterUndefs(commandLineOptions || {}), {
                configPath: aPath,
            });
            if (options.sclang) {
                options.sclang = path_1.default.resolve(untildify_1.default(options.sclang));
            }
            if (options.scsynth) {
                options.scsynth = path_1.default.resolve(untildify_1.default(options.scsynth));
            }
            resolve(options);
        }
        function checkPath(aPath) {
            var resolvedPath = path_1.default.resolve(untildify_1.default(aPath));
            return fs_1.default.existsSync(resolvedPath) ? resolvedPath : null;
        }
        function loadConfig(aPath) {
            try {
                var options = js_yaml_1.default.safeLoad(fs_1.default.readFileSync(aPath, "utf8"));
                ok(options, aPath);
            }
            catch (error) {
                reject(new Errors_1.SCError("Error reading config file " + aPath + ": " + error.mesage, {
                    error: error,
                    configPath: aPath,
                }));
            }
        }
        if (configPath) {
            // explicit config path supplied
            var explicitConfigPath = checkPath(configPath);
            if (!explicitConfigPath) {
                reject(new Error("Config file not found: " + configPath));
            }
            else {
                loadConfig(explicitConfigPath);
            }
        }
        else {
            // look in cwd
            var localConfigPath = checkPath(".supercollider.yaml");
            if (localConfigPath) {
                loadConfig(localConfigPath);
            }
            else {
                // look in ~
                var homeDirConfigPath = checkPath(path_1.default.join(getUserHome(), ".supercollider.yaml"));
                if (homeDirConfigPath) {
                    loadConfig(homeDirConfigPath);
                }
                else {
                    // use the defaults
                    ok({}, null);
                }
            }
        }
    });
}
exports.default = resolveOptions;
//# sourceMappingURL=resolveOptions.js.map