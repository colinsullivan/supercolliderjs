"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var each_1 = tslib_1.__importDefault(require("lodash/each"));
var index_1 = require("../index");
function makePlayer(dryad) {
    return index_1.dryadic(dryad);
}
exports.makePlayer = makePlayer;
function expectPlayGraphToEqual(dryad, expected, ignoreFn) {
    var p = makePlayer(dryad);
    var g = p.tree.hyperscript();
    if (ignoreFn) {
        g = ignoreFn(g);
        if (expected) {
            expected = ignoreFn(expected);
        }
    }
    if (expected) {
        expect(g).toEqual(expected);
    }
    return g;
}
exports.expectPlayGraphToEqual = expectPlayGraphToEqual;
/**
 * Get a command object to inspect it for testing.
 * Calls any function in scserver msg/bundle so the result
 * will be the actual OSC message/bundle.
 *
 * @param  player
 * @param  commandName  'add' 'remove' etc.
 * @param  {Array}  [childAt=[]] Index array to fetch a child command
 *                               for examining the command of a child.
 *                               Especially useful when the Dryad uses
 *                               requireParent or Properties so that the
 *                               command you are testing is not the
 *                               top level.
 * @return Command object
 */
function getCommand(player, commandName, childAt) {
    if (childAt === void 0) { childAt = []; }
    var cmd = player._collectCommands(commandName);
    // specify which child you want to get the command for with indices:
    // null top
    // [0] first child
    // [0, 0] first child first child
    var obj = cmd;
    each_1.default(childAt, function (i) {
        obj = obj.children[i];
    });
    return obj;
}
exports.getCommand = getCommand;
// export function getOSCMsg(player:DryadPlayer, commandName:string='add', childAt:[number]=[])
//   let cmd = getCommand(player, commandName, childAt);
//   // this is actually calling the CommandNode
//   console.log('getCommand got', cmd);
//
//   if (cmd.commands.scserver) {
//     // msg
//
//     // value them with context and properties
//     let properties = cmd.resolveProperties();
//     let msg = cmd.
//     obj.commands.scserver = resolveFuncs(obj.commands.scserver, obj.context, obj.properties);
//   }
//
//   return obj;
// }
//# sourceMappingURL=test-utils.js.map