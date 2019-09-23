/// <reference types="node" />
import { CallAndResponse, CompletionMsg, MsgType, OscType, OscValues } from "../../Types";
/**
 * Many scsynth OSC commands accept lists of params:
 *
 *    [\freq, 440, \pan, 0, \amp, 0.9]
 *
 * In supercollider.js these can be passed as objects:
 *
 *    {freq: 440, pan: 0, amp: 0.9}
 *
 * or as a list:
 *
 *    [['freq', 440], ['pan', 0], ['amp', 0.9]]
 */
declare type PairsType = Params | ParamList;
export interface Params {
    [name: string]: OscType;
}
declare type Param = OscType[];
declare type ParamList = Param[];
/**
 * Add actions for specifying relationship of newly adding node
 * to its targetID
 *
 * - 0 add the new group to the the head of the group specified by the add target ID.
 * - 1 add the new group to the the tail of the group specified by the add target ID.
 * - 2 add the new group just before the node specified by the add target ID.
 * - 3 add the new group just after the node specified by the add target ID.
 * - 4 the new node replaces the node specified by the add target ID. The target node is freed.
 * @memberof msg
 */
export declare enum AddActions {
    HEAD = 0,
    TAIL = 1,
    BEFORE = 2,
    AFTER = 3,
    REPLACE = 4
}
/**
 * Tell server to exit
 *
 * @return {Array} - OSC message
 */
export declare function quit(): MsgType;
/**
  * Register to receive notifications from server

  * Asynchronous. Replies with `/done /notify clientID`. If this client has registered for notifications before, this may be the same ID. Otherwise it will be a new one. Clients can use this ID in multi-client situations to avoid conflicts in node IDs, bus indices, buffer numbers, etc.

  * @param {int} on - start or stop
    If argument is 1, server will remember your return address and send you notifications. 0 will stop sending notifications.
  * @return {Array} - OSC message
  */
export declare function notify(on?: number): CallAndResponse;
/**
  * Query for server status.

  * Server replies with `/status.reply`

  * @return {Array} - OSC message
  */
export declare function status(): CallAndResponse;
/**
 * Execute a command defined by a UGen Plug-in
 *
 * @return {Array} - OSC message
 */
export declare function cmd(command: number, args?: OscValues): MsgType;
/**
 * Dump incoming OSC messages to stdout
 * @param {int} code -
 * 0 turn dumping OFF.
 * 1 print the parsed contents of the message.
 * 2 print the contents in hexadecimal.
 * 3 print both the parsed and hexadecimal representations of the contents.
 * @return {Array} - OSC message
 */
export declare function dumpOSC(code?: number): MsgType;
/**
 * Notify when async commands have completed.
 *
 * Replies with a `/synced` message when all asynchronous commands received before this one have completed. The reply will contain the sent unique ID.
 *
 * Asynchronous. Replies with `/synced ID` .
 *
 * @param {int} id - a unique number identifying this command.
 * @return {Array} - OSC message
 */
export declare function sync(id: number): CallAndResponse;
/**
 * Clear all scheduled bundles. Removes all bundles from the scheduling queue.
 *
 * @return {Array} - OSC message
 */
export declare function clearSched(): MsgType;
/**
 * Enable/disable error message posting.
 * @param {int} on
 * @return {Array} - OSC message
 */
export declare function error(on?: number): MsgType;
/**** Synth Definition Commands **  */
/**
 * Loads a file of synth definitions from a data buffer included in the message. Resident definitions with the same names are overwritten.
 *
 * Asynchronous. Replies with `/done`.
 *
 * @param {Buffer} buffer - A node global datatype: new Buffer(array)
 * @param {Array} completionMsg
 * @return {Array} - OSC message
 *
 */
export declare function defRecv(buffer: Buffer, completionMsg?: CompletionMsg | null): CallAndResponse;
/**
  * Load synth definition.
  *
  * Loads a file of synth definitions. Resident definitions with the same names are overwritten.
  * Asynchronous. Replies with `/done`.

  * @param {String} path
  * @param {Array} completionMsg
  * @return {Array} - OSC message
  */
export declare function defLoad(path: string, completionMsg?: CompletionMsg | null): CallAndResponse;
/**
 * Load a directory of synth definitions.
 *
 * Asynchronous. Replies with `/done`.
 *
 * @param {String} path
 * @param {Array} completionMsg
 * @return {Array} - OSC message
 */
export declare function defLoadDir(path: string, completionMsg?: CompletionMsg | null): CallAndResponse;
/**
 * Delete synth definition.
 *
 * The definition is removed immediately, and does not wait for synth nodes based on that definition to end.
 *
 * @param {String} defName
 * @return {Array} - OSC message
 */
export declare function defFree(defName: string): MsgType;
/******* Node Commands **********************  */
/**
 * Delete/free a node
 * @param {int} nodeID
 * @return {Array} - OSC message
 */
export declare function nodeFree(nodeID: number): MsgType;
/**
 * Stop/start a node from running
 *
 * Save computation by turning a node (and its children) off
 * but without removing it from the UGen graph
 * @param {int} nodeID
 * @param {int} on - binary boolean
 * @return {Array} - OSC message
 */
export declare function nodeRun(nodeID: number, on?: number): MsgType;
/**
 * Set a node's control value(s).
 *
 * Takes a list of pairs of control indices and values and sets the controls to
 * those values. If the node is a group, then it sets the controls of every node
 * in the group.
 *
 * This message now supports array type tags (`$[` and `$]`) in the control/value
 * component of the OSC message.  Arrayed control values are applied in the
 * manner of `n_setn` (i.e., sequentially starting at the indexed or named control).
 *
 * I think this also takes `[freq, 440]`
 *
 * @example
 * ```js
 *  nodeSet(id, [[0, 440], ...])
 *  ```
 *
 * @param {int} nodeID
 * @param {object|Array} pairs - `[[key, value], ...]` or `{key: value, ...}`
 * @return {Array} - OSC message
 */
export declare function nodeSet(nodeID: number, pairs: PairsType): MsgType;
/**
 * Set ranges of a node's control value(s).
 *
 * Set contiguous ranges of control indices to sets of values. For each range,
 * the starting control index is given followed by the number of controls to change,
 * followed by the values. If the node is a group, then it sets the controls of every
 * node in the group.
 *
 * @param {int} nodeID -
 * @param {Array} valueSets - `[[controlName|index, numValues, value1, ... valueN], ...]`
 * @return {Array} - OSC message
 */
export declare function nodeSetn(nodeID: number, valueSets: PairsType): MsgType;
/**
 * Fill ranges of a node's control value(s).
 *
 * Set contiguous ranges of control indices to single values. For each range,
 * the starting control index is given followed by the number of controls to
 * change, followed by the value to fill. If the node is a group, then it
 * sets the controls of every node in the group.
 *
 * @param {int} nodeID -
 * @param {Array} triples - `[[key, numValuesToFill, value], ...]`
 * @return {Array} - OSC message
 */
export declare function nodeFill(nodeID: number, triples?: PairsType): MsgType;
/**
 * Map a node's controls to read from a bus.
 *
 * @param {int} nodeID -
 * @param {Array|object} pairs - `[[controlName, busID], ...]`
 * @return {Array} - OSC message
 *
 * Takes a list of pairs of control names or indices and bus indices and causes those controls to be read continuously from a global control bus. If the node is a group, then it maps the controls of every node in the group. If the control bus index is -1 then any current mapping is undone. Any n_set, n_setn and n_fill command will also unmap the control.
 */
export declare function nodeMap(nodeID: number, pairs?: PairsType): MsgType;
/**
  * Map a node's controls to read from buses.
  *
  * Takes a list of triples of control names or indices, bus indices, and number of controls to map and causes those controls to be mapped sequentially to buses. If the node is a group, then it maps the controls of every node in the group. If the control bus index is -1 then any current mapping is undone. Any n_set, n_setn and n_fill command will also unmap the control.
  *
  * @param {int} nodeID -
  * @param {Array} triples - `[[controlName|index, busID, numControlsToMap], ...]`
  * @return {Array} - OSC message

  */
export declare function nodeMapn(nodeID: number, triples?: PairsType): MsgType;
/**
 * Map a node's controls to read from an audio bus.
 *
 * Takes a list of pairs of control names or indices and audio bus indices and causes those controls to be read continuously from a global audio bus. If the node is a group, then it maps the controls of every node in the group. If the audio bus index is -1 then any current mapping is undone. Any n_set, n_setn and n_fill command will also unmap the control. For the full audio rate signal, the argument must have its rate set to \ar.
 *
 * @param {int} nodeID -
 * @param {Array} pairs - `[[controlName|index, audioBusID], ...]`
 * @return {Array} - OSC message
 */
export declare function nodeMapAudio(nodeID: number, pairs: PairsType): MsgType;
/**
 * Map a node's controls to read from audio buses.
 *
 * @param {int} nodeID -
 * @param {Array} triples - `[[controlName|index, audioBusID, numControlsToMap], ...]`
 * @return {Array} - OSC message
 *
 * Takes a list of triples of control names or indices, audio bus indices, and number of controls to map and causes those controls to be mapped sequentially to buses. If the node is a group, then it maps the controls of every node in the group. If the audio bus index is -1 then any current mapping is undone. Any `n_set`, `n_setn` and `n_fill` command will also unmap the control. For the full audio rate signal, the argument must have its rate set to `\ar`.
 */
export declare function nodeMapAudion(nodeID: number, triples?: PairsType): MsgType;
/**
 * Places node A in the same group as node B, to execute immediately before node B.
 *
 * @param {int} moveNodeID - the node to move (A)
 * @param {int} beforeNodeID - the node to move A before
 * @return {Array} - OSC message
 */
export declare function nodeBefore(moveNodeID: number, beforeNodeID: number): MsgType;
/**
 * Places node A in the same group as node B, to execute immediately after node B.
 *
 * @param {int} moveNodeID - the ID of the node to place (A)
 * @param {int} afterNodeID - the ID of the node after which the above is placed (B)
 * @return {Array} - OSC message
 */
export declare function nodeAfter(moveNodeID: number, afterNodeID: number): MsgType;
/**
 * Get info about a node.
 *
 * The server sends an `/n_info` message for each node to registered clients.
 * See Node Notifications for the format of the `/n_info` message.
 *
 * @param {int} nodeID
 * @return {Array} - OSC message
 */
export declare function nodeQuery(nodeID: number): CallAndResponse;
/**
 * Trace a node.
 *
 * Causes a synth to print out the values of the inputs and outputs of its unit generators for one control period. Causes a group to print the node IDs and names of each node in the group for one control period.
 *
 * @param {int} nodeID
 * @return {Array} - OSC message
 */
export declare function nodeTrace(nodeID: number): MsgType;
/**
 * Move and order a list of nodes.
 *
 * Move the listed nodes to the location specified by the target and add action, and place them in the order specified. Nodes which have already been freed will be ignored.
 *
 * @param {int} addAction
 * @param {int} targetID
 * @param {Array.<int>} nodeIDs
 * @return {Array} - OSC message
 */
export declare function nodeOrder(addAction: number, targetID: number, nodeIDs: [number]): MsgType;
/***** Synth Commands  **  */
/**
  * Create a new synth.

  Create a new synth from a named, compiled and already loaded synth definition, give it an ID, and add it to the tree of nodes.

  There are four ways to add the node to the tree as determined by the add action argument

  Controls may be set when creating the synth. The control arguments are the same as for the `n_set` command.

  If you send `/s_new` with a synth ID of -1, then the server will generate an ID for you. The server reserves all negative IDs. Since you don't know what the ID is, you cannot talk to this node directly later. So this is useful for nodes that are of finite duration and that get the control information they need from arguments and buses or messages directed to their group. In addition no notifications are sent when there are changes of state for this node, such as `/n_go`, `/n_end`, `/n_on`, `/n_off`.

  If you use a node ID of -1 for any other command, such as `/n_map`, then it refers to the most recently created node by `/s_new` (auto generated ID or not). This is how you can map  the controls of a node with an auto generated ID. In a multi-client situation, the only way you can be sure what node -1 refers to is to put the messages in a bundle.

  This message now supports array type tags (`$[` and `$]`) in the control/value component of the OSC message.  Arrayed control values are applied in the manner of n_setn (i.e., sequentially starting at the indexed or named control). See the linkGuides/NodeMessaging helpfile.

  * @param {object} args
  * - key: a control index or name
  * - value: floating point and integer arguments are interpreted
  *          as control value.
  * A symbol argument consisting of the letter 'c' or 'a' (for control or audio) followed by the bus's index.
  * @return OSC message
  */
export declare function synthNew(defName: string, nodeID?: number, addAction?: number, targetID?: number, args?: PairsType): MsgType;
/**
  * Get control value(s).

  * @param {int} synthID
  * @param {Array.<int|String>} controlNames - index or names
  * @return {Array} - OSC message

  Replies with the corresponding `/n_set` command.
  */
export declare function synthGet(synthID: number, controlNames: [number | string]): CallAndResponse;
/**
  Get ranges of control value(s).

  * @param {int} synthID
  * @param {int|String} controlName - a control index or name
  * @param {int} n - number of sequential controls to get (M)
  * @return {Array} - OSC message

  Get contiguous ranges of controls. Replies with the corresponding `/n_setn` command.
  */
export declare function synthGetn(synthID: number, controlName: number | string, n: number): CallAndResponse;
/**
  * Auto-reassign synths' ID to a reserved value.

  This command is used when the client no longer needs to communicate with the synth and wants to have the freedom to reuse the ID. The server will reassign this synth to a reserved negative number. This command is purely for bookkeeping convenience of the client. No notification is sent when this occurs.

  * @param {Array} synthIDs
  * @return {Array} - OSC message
  */
export declare function synthNoid(synthIDs: [number]): MsgType;
/****** Group Commands ***  */
/**
  Create a new group.

  Create a new group and add it to the tree of nodes.
  There are four ways to add the group to the tree as determined by the add action argument

  * @param {int} nodeID - new group ID
  * @param {int} addAction
  * @param {int} targetID
  * @return {Array} - OSC message
  */
export declare function groupNew(nodeID: number, addAction?: number, targetID?: number): MsgType;
/**
  Create a new parallel group.  supernova only

  Create a new parallel group and add it to the tree of nodes. Parallel groups are relaxed groups, their child nodes are evaluated in unspecified order.
  There are four ways to add the group to the tree as determined by the add action argument

  Multiple groups may be created in one command by adding arguments. (not implemented here)

  * @param {int} groupID - new group ID
  * @param {int} addAction - add action
  * @param {int} targetID
  * @return {Array} - OSC message
  */
export declare function parallelGroupNew(groupID: number, addAction?: number, targetID?: number): MsgType;
/**
 * Moves node to the head (first to be executed) of the group.
 *
 * @param {int} groupID
 * @param {int} nodeID
 * @param {...int} rest - more node IDs to also move to head
 * @return {Array} - OSC message
 */
export declare function groupHead(groupID: number, nodeID: number, ...rest: number[]): MsgType;
/**
  * Moves node to the tail (last to be executed) of the group.

  * @param {int} groupID
  * @param {int} nodeID
  * @param {...int} rest - more node IDs to also move to tail
  * @return {Array} - OSC message
  */
export declare function groupTail(groupID: number, nodeID: number, ...rest: number[]): MsgType;
/**
  Frees all immediate children nodes in the group

  * @param {int} groupID
  * @return {Array} - OSC message
  */
export declare function groupFreeAll(groupID: number): MsgType;
/**
 * Free all synths in this group and all its sub-groups.
 *
 * Traverses all groups below this group and frees all the synths. Sub-groups are not freed.
 *
 * @param {int} groupID
 * @return {Array} - OSC message
 */
export declare function groupDeepFree(groupID: number): MsgType;
/**
  * Post a representation of this group's node subtree to STDOUT

  Posts a representation of this group's node subtree, i.e. all the groups and synths contained within it, optionally including the current control values for synths.

  * @param {int} groupID
  * @param {int} dumpControlValues -   if not 0 post current control (arg) values for synths to STDOUT
  * @return {Array} - OSC message
  *
  */
export declare function groupDumpTree(groupID: number, dumpControlValues?: number): MsgType;
/**
  * Get a representation of this group's node subtree.

  Request a representation of this group's node subtree, i.e. all the groups and synths contained within it. Replies to the sender with a `/g_queryTree.reply` message listing all of the nodes contained within the group in the following format:

  * param {int} - flag: if synth control values are included 1, else 0
  * param {int} nodeID - of the requested group
  * param {int} - number of child nodes contained within the requested group
  * then for each node in the subtree:
      * param {int} nodeID -
      * param {int} - number of child nodes contained within this node. If -1 this is a synth, if >=0 it's a group
      * then, if this node is a synth:
      * strongsymbol the SynthDef name for this node.
    * then, if flag (see above) is true:
      * param {int} - numControls for this synth (M)
      * multiple:
          * param {string|int} - control name or index
          * param {float|String} value or control bus mapping symbol (e.g. 'c1')


  * N.B. The order of nodes corresponds to their execution order on the server. Thus child nodes (those contained within a group) are listed immediately following their parent. See the method Server:queryAllNodes for an example of how to process this reply.
  *

  * @param {int} groupID
  * @param {int} dumpControlValues -  if not 0 the current control (arg) values for synths will be included
  * @return {Array} - OSC message
  */
export declare function groupQueryTree(groupID: number, dumpControlValues?: number): CallAndResponse;
/***** Unit Generator Commands ***  */
/**
  * Send a command to a unit generator.

   Sends all arguments following the command name to the unit generator to be performed. Commands are defined by unit generator plug ins.

  * @param {int} nodeID -
  * @param {int} uGenIndex - unit generator index
  * @param {String} command -
  * @param {Array} args
  * @return {Array} - OSC message
  */
export declare function ugenCmd(nodeID: number, uGenIndex: number, command: string, args?: OscValues): MsgType;
/***** Buffer Commands ***  */
/**
  * Allocates zero filled buffer to number of channels and samples.

  * Asynchronous. Replies with `/done /b_alloc bufNum`.

  * @param {int} bufferID
  * @param {int} numFrames
  * @param {int} numChannels
  * @param {Array} completionMsg - (optional)
  * @return {Array} - OSC message
  */
export declare function bufferAlloc(bufferID: number, numFrames: number, numChannels: number, completionMsg?: CompletionMsg | null): CallAndResponse;
/**
  * Allocate buffer space and read a sound file.

  Allocates buffer to number of channels of file and number of samples requested, or fewer if sound file is smaller than requested. Reads sound file data from the given starting frame in the file. If the number of frames argument is less than or equal to zero, the entire file is read.
  * Asynchronous. Replies with `/done /b_allocRead bufNum`.

  * @param {int} bufferID
  * @param {String} path - name of a sound file.
  * @param {int} startFrame - starting frame in file (optional. default = 0)
  * @param {int} numFramesToRead - number of frames to read (optional. default = 0, see below)
  * @param {Array} completionMsg - (optional)
  * @return {Array} - OSC message
  */
export declare function bufferAllocRead(bufferID: number, path: string, startFrame?: number, numFramesToRead?: number, completionMsg?: CompletionMsg | null): CallAndResponse;
/**
  * Allocate buffer space and read channels from a sound file.

  As `b_allocRead`, but reads individual channels into the allocated buffer in the order specified.
  * Asynchronous. Replies with `/done /b_allocReadChannel bufNum`.

  * @param {int} bufferID - buffer number
  * @param {String} path - path name of a sound file
  * @param {int} startFrame - starting frame in file
  * @param {int} numFramesToRead - number of frames to read
  * @param {Array.<int>} channels - source file channel indices
  * @param {Array} completionMsg - (optional)
  * @return {Array} - OSC message
  */
export declare function bufferAllocReadChannel(bufferID: number, path: string, startFrame: number, numFramesToRead: number, channels: number[], completionMsg?: CompletionMsg | null): CallAndResponse;
/**
  * Read sound file data into an existing buffer.

    Reads sound file data from the given starting frame in the file and writes it to the given starting frame in the buffer. If number of frames is less than zero, the entire file is read.

    If reading a file to be used by `DiskIn` ugen then you will want to set "leave file open" to one, otherwise set it to zero.

  * Asynchronous. Replies with `/done /b_read bufNum`.
  *
  * @param {int} bufferID
  * @param {String} path - path name of a sound file.
  * @param {int} startFrame - starting frame in file (optional. default = 0)
  * @param {int} numFramesToRead - number of frames to read (optional. default = -1, see below)
  * @param {int} startFrameInBuffer - starting frame in buffer (optional. default = 0)
  * @param {int} leaveFileOpen - leave file open (optional. default = 0)
  * @param {Array} completionMsg - (optional)
  * @return {Array} - OSC message
  */
export declare function bufferRead(bufferID: number, path: string, startFrame?: number, numFramesToRead?: number, startFrameInBuffer?: number, leaveFileOpen?: number, completionMsg?: CompletionMsg | null): CallAndResponse;
/**
  * Read sound file channel data into an existing buffer.

  * As `b_read`, but reads individual channels in the order specified. The number of channels requested must match the number of channels in the buffer.

  * Asynchronous. Replies with `/done /b_readChannel bufNum`.

  * @param {int} bufferID
  * @param {String} path - of a sound file
  * @param {int} startFrame - starting frame in file
  * @param {int} numFramesToRead - number of frames to read
  * @param {int} startFrameInBuffer - starting frame in buffer
  * @param {int} leaveFileOpen - leave file open
  * @param {Array.<int>} channels - source file channel indexes
  * @param {Array} completionMsg
  * @return {Array} - OSC message
  */
export declare function bufferReadChannel(bufferID: number, path: string, startFrame?: number, numFramesToRead?: number, startFrameInBuffer?: number, leaveFileOpen?: number, channels?: number[], completionMsg?: CompletionMsg | null): CallAndResponse;
/**
  * Write buffer contents to a sound file.

  * Not all combinations of header format and sample format are possible.

  If number of frames is less than zero, all samples from the starting frame to the end of the buffer are written.
  If opening a file to be used by DiskOut ugen then you will want to set "leave file open" to one, otherwise set it to zero. If "leave file open" is set to one then the file is created, but no frames are written until the DiskOut ugen does so.

  * Asynchronous. Replies with `/done /b_write bufNum`.

  * @param {int} bufferID
  * @param {String} path - path name of a sound file.
  * @param {String} headerFormat -
  * Header format is one of: "aiff", "next", "wav", "ircam"", "raw"
  * @param {String} sampleFormat -
  * Sample format is one of: "int8", "int16", "int24", "int32", "float", "double", "mulaw", "alaw"
  * @param {int} numFramesToWrite - number of frames to write (optional. default = -1, see below)
  * @param {int} startFrameInBuffer - starting frame in buffer (optional. default = 0)
  * @param {int} leaveFileOpen - leave file open (optional. default = 0)
  * @param {Array} completionMsg - (optional)
  * @return {Array} - OSC message
  */
export declare function bufferWrite(bufferID: number, path: string, headerFormat?: string, sampleFormat?: string, numFramesToWrite?: number, startFrameInBuffer?: number, leaveFileOpen?: number, completionMsg?: CompletionMsg | null): CallAndResponse;
/**
 * Frees buffer space allocated for this buffer.
 *
 * Asynchronous. Replies with `/done /b_free bufNum`.
 *
 * @param {int} bufferID
 * @param {Array} completionMsg - (optional)
 * @return {Array} - OSC message
 */
export declare function bufferFree(bufferID: number, completionMsg?: CompletionMsg | null): CallAndResponse;
/**
  * Sets all samples in the buffer to zero.
  *
  * Asynchronous. Replies with `/done /b_zero bufNum`.

  * @param {int} bufferID
  * @param {Array} completionMsg - (optional)
  * @return {Array} - OSC message
  */
export declare function bufferZero(bufferID: number, completionMsg?: CompletionMsg | null): CallAndResponse;
/**
  * Takes a list of pairs of sample indices and values and sets the samples to those values.

  * @param {int} bufferID
  * @param {Array} pairs - `[[frame, value], ...]`
  * @return {Array} - OSC message
  */
export declare function bufferSet(bufferID: number, pairs: PairsType): MsgType;
/**
  * Set ranges of sample value(s).

  * Set contiguous ranges of sample indices to sets of values. For each range, the starting sample index is given followed by the number of samples to change, followed by the values.

  * @param {int} bufferID
  * @param {int} startFrame
  * @param {Array.<float>} values
  * @return {Array} - OSC message
  */
export declare function bufferSetn(bufferID: number, startFrame: number, values?: number[]): MsgType;
/**
  * Fill ranges of samples with a value

  * Set contiguous ranges of sample indices to single values. For each range, the starting sample index is given followed by the number of samples to change, followed by the value to fill. This is only meant for setting a few samples, not whole buffers or large sections.

  * @param {int} bufferID
  * @param {int} startFrame
  * @param {int} numFrames
  * @param {float} value
  * @return {Array} - OSC message
  */
export declare function bufferFill(bufferID: number, startFrame: number, numFrames: number, value: number): MsgType;
/**
  * Call a command to fill a buffer.

  * Plug-ins can define commands that operate on buffers. The arguments after the command name are defined by the command. The currently defined buffer fill commands are listed below in a separate section.

  * Asynchronous. Replies with `/done /b_gen bufNum`.

  * @param {int} bufferID
  * @param {String} command
  * @param {Array} args
  * @return {Array} - OSC message
  */
export declare function bufferGen(bufferID: number, command: string, args?: OscValues): CallAndResponse;
/**
  * After using a buffer with `DiskOut`, close the soundfile and write header information.

  * Asynchronous. Replies with `/done /b_close bufNum`.

  * @param {int} bufferID
  * @return {Array} - OSC message
  */
export declare function bufferClose(bufferID: number): CallAndResponse;
/**
  * Get buffer info.

  * Responds to the sender with a `/b_info` message with:
  * multiple:
      * param {int} bufferID
      * param {int} - number of frames
      * param {int} - number of channels
      * param {float} sample rate

  * @param {int} bufferID
  * @return {Array} - OSC message
  */
export declare function bufferQuery(bufferID: number): CallAndResponse;
/**
 * Get sample value(s).
 * Replies with the corresponding `/b_set` command.
 *
 * @param {int} bufferID - buffer number
 * @param {Array} framesArray - sample indices to return
 */
export declare function bufferGet(bufferID: number, framesArray: [number]): CallAndResponse;
/**
    Get ranges of sample value(s).

    Get contiguous ranges of samples. Replies with the corresponding `b_setn` command. This is only meant for getting a few samples, not whole buffers or large sections.

  * @param {int} bufferID
  * @param {int} startFrame - starting sample index
  * @param {int} numFrames - number of sequential samples to get (M)
  * @return {Array} - OSC message
  */
export declare function bufferGetn(bufferID: number, startFrame: number, numFrames: number): CallAndResponse;
/***** Control Bus Commands ***  */
/**
 * Takes a list of pairs of bus indices and values and sets the buses to those values.
 *
 * @param {Array} pairs - `[[busID, value], ...]`
 * @return {Array} - OSC message
 */
export declare function controlBusSet(pairs: PairsType): MsgType;
/**
  * Set ranges of bus value(s).

  * Set contiguous ranges of buses to sets of values. For each range, the starting bus index is given followed by the number of channels to change, followed by the values.
  *
  * @param {Array} triples - `[[firstBusID, numBussesToChange, value], ...]`
  * @return {Array} - OSC message
  */
export declare function controlBusSetn(triples?: PairsType): MsgType;
/**
 * Fill ranges of bus value(s).
 *
 * Set contiguous ranges of buses to single values. For each range, the starting sample index is given followed by the number of buses to change, followed by the value to fill.
 *
 * TODO: What is difference to `c_setn` ?
 *
 * @param {Array} triples - `[[firstBusID, numBussesToChange, value], ...]`
 * @return {Array} - OSC message
 */
export declare function controlBusFill(triples?: PairsType): MsgType;
/**
 * Get control bus values
 *
 * Takes a bus ID and replies with the corresponding `c_set` command.
 *
 * @param {Number} busID
 */
export declare function controlBusGet(busID: number): CallAndResponse;
/**
 * Get contiguous ranges of buses. Replies with the corresponding `c_setn` command.
 *
 * @param {int} startBusIndex - starting bus index
 * @param {int} numBusses - number of sequential buses to get (M)
 */
export declare function controlBusGetn(startBusIndex: number, numBusses: number): CallAndResponse;
/***** Non Real Time Mode Commands ***  */
/**
  End real time mode, close file.  Not yet implemented on server

  This message should be sent in a bundle in non real time mode.
  The bundle timestamp will establish the ending time of the file.
  This command will end non real time mode and close the sound file.
  Replies with `/done`.

  */
export declare function nonRealTimeEnd(): CallAndResponse;
export {};
