export interface Event {
    time: number;
}
export declare function sortEvents(events: Event[]): Event[];
export declare function clipTime(events: Event[], start: number, end: number): Event[];
/**
 * eventListIterator - Creates a function for use in a getNextEvent iterator that returns events sequentially
 *
 * @param  {Array} events Events are objects with .time attribute.
 * @return {Function}      arguments:
 *                          {number} now - in seconds,
 *                          {object} memo - used internally
 *                          If memo is not supplied then it will search for the next event
 *                          greater than or equal to 'now'
 *                          and if memo IS supplied then it iterates over the sorted event list.
 *                         returns {object} event - Which has .event (the original event) and .memo which is
 *                              used by OSCSched the next time this function is called.
 */
export declare function eventListIterator(events: Event[]): Function;
/**
 * loopedEventListIterator - Creates a function for use in a getNextEvent iterator that loops over an event list
 *
 * @param  {Array} events   Events are objects with .time attribute.
 * @param  {number} loopTime The iterator will loop from 0 .. loopTime. Events past the loop are ignored (never played).
 * @return {Function}      arguments:
 *
 *   {number} now - in seconds,
 *   {object} memo - used internally
 *   If memo is not supplied then it will search for the next event
 *   greater than or equal to 'now'
 *   and if memo *is* supplied then it iterates over the sorted event list.
 *
 *   returns {object} item - Which has .event (the original event) and .memo which is
 *                              used by OSCSched the next time this function is called.
 */
export declare function loopedEventListIterator(events: Event[], loopTime: number): Function;
