import { Map } from "immutable";
export declare type State = Map<string, any>;
/**
 * A Store that holds a state tree. This is used by ServerState as
 * its immutable memory storage.
 *
 * Holds an Immutable.Map
 * and offers functions to mutate sub-states
 * in that tree, and stores the new state.
 *
 * https://facebook.github.io/immutable-js/docs/#/Map
 */
export default class Store {
    state: State;
    constructor();
    getIn(keys: string[], notSetValue: any): any;
    /**
     * Fetch the object at keys
     * pass it to the function which mutates it and returns new sub state.
     */
    mutateState(keys: string[], fn: (value: any) => any): void;
    /**
     * Fetch one part of the state,
     * mutate it with the callback,
     * which returns result, subState.
     * Save the subState back into state and return the result.
     *
     * @returns {any} result
     */
    mutateStateAndReturn(keys: string[], fn: Function): any;
}
