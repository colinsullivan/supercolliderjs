"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
var dryadic_1 = require("dryadic");
var node_watcher_1 = require("../server/node-watcher");
var msg_1 = require("../server/osc/msg");
/**
 * Creates a group on the server; sets .group in context for its children,
 * so any Synths or Groups will be spawned inside this group.
 */
var Group = /** @class */ (function (_super) {
    tslib_1.__extends(Group, _super);
    function Group() {
        return _super !== null && _super.apply(this, arguments) || this;
    }
    /**
     * If there is no SCServer in the parent context,
     * then this will wrap itself in an SCServer
     */
    Group.prototype.requireParent = function () {
        return "SCServer";
    };
    Group.prototype.prepareForAdd = function () {
        return {
            callOrder: "SELF_THEN_CHILDREN",
            updateContext: function (context /*, properties*/) {
                var nodeID = context.scserver.state.nextNodeID();
                return {
                    nodeID: nodeID,
                    // TODO: but this overwrites my own group !
                    // what if parent is a group ?
                    // I need to create this group within that group
                    // This should just be childContext,
                    // but that is only called when creating the tree.
                    group: nodeID,
                    // for now, save it to parentGroup
                    parentGroup: context.group || 0,
                };
            },
        };
    };
    Group.prototype.add = function () {
        return {
            scserver: {
                msg: function (context) { return msg_1.groupNew(context.nodeID, msg_1.AddActions.TAIL, context.parentGroup); },
            },
            run: function (context) { return node_watcher_1.whenNodeGo(context.scserver, context.id, context.nodeID); },
        };
    };
    Group.prototype.remove = function () {
        return {
            scserver: {
                // children do not have to free their nodes
                // as they get freed by freeing this parent
                // so remove for children needs to communicate that somehow
                // but buffers and busses do need to free
                msg: function (context) { return msg_1.nodeFree(context.nodeID); },
            },
            run: function (context) { return node_watcher_1.whenNodeEnd(context.scserver, context.id, context.nodeID); },
        };
    };
    return Group;
}(dryadic_1.Dryad));
exports.default = Group;
//# sourceMappingURL=Group.js.map