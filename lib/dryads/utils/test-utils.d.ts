import { Dryad, DryadPlayer } from "dryadic";
import { JSONType } from "../../Types";
export declare function makePlayer(dryad: Dryad): DryadPlayer;
export declare function expectPlayGraphToEqual(dryad: Dryad, expected: JSONType, ignoreFn?: Function): JSONType;
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
export declare function getCommand(player: DryadPlayer, commandName: string, childAt?: number[]): object;
