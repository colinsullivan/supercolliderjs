"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var tslib_1 = require("tslib");
/**
 * @module iterators
 * @ temp off - memberof dryads
 */
var lodash_1 = tslib_1.__importDefault(require("lodash"));
function sortEvents(events) {
    return events.sort(function (a, b) { return a.time - b.time; });
}
exports.sortEvents = sortEvents;
function clipTime(events, start, end) {
    return events.filter(function (e) { return e.time >= start && e.time <= end; });
}
exports.clipTime = clipTime;
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
function eventListIterator(events) {
    var sorted = sortEvents(events);
    var length = sorted.length;
    return function (now, memo) {
        if (length === 0) {
            return;
        }
        if (memo) {
            // memo, get next event
            var event_1 = sorted[memo.i];
            if (event_1) {
                return {
                    event: event_1,
                    memo: { i: memo.i + 1 },
                };
            }
        }
        else {
            // search for first positive delta
            for (var i = 0; i < length; i += 1) {
                var event_2 = sorted[i];
                var delta = event_2.time - now;
                if (delta >= 0) {
                    return {
                        event: event_2,
                        memo: { i: i + 1 },
                    };
                }
            }
        }
    };
}
exports.eventListIterator = eventListIterator;
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
function loopedEventListIterator(events, loopTime) {
    var sorted = clipTime(sortEvents(events), 0, loopTime);
    var length = sorted.length;
    return function (now, memo) {
        if (length === 0) {
            return;
        }
        if (memo) {
            var event_3 = sorted[memo.i % length];
            var iteration = Math.floor(memo.i / length);
            var timeBase = iteration * loopTime;
            if (event_3) {
                // if (now > timeBase + event.time) {
                //   throw new Error('loopedEventListIterator and event is in the past');
                // }
                return {
                    event: lodash_1.default.assign({}, event_3, { time: timeBase + event_3.time }),
                    memo: { i: memo.i + 1 },
                };
            }
        }
        else {
            // search for first positive delta
            var iteration = Math.max(Math.floor(now / loopTime), 0);
            var timeBase = iteration * loopTime;
            var lastEventTime = sorted[length - 1].time;
            if (now > timeBase + lastEventTime && now < timeBase + loopTime) {
                // play position is between lastEvent and loopTime
                // so start search in next loop, not at start of current one
                timeBase = timeBase + loopTime;
            }
            for (var i = 0; i < length; i += 1) {
                var event_4 = sorted[i];
                var time = timeBase + event_4.time;
                var delta = time - now;
                if (delta >= 0) {
                    return {
                        event: lodash_1.default.assign({}, event_4, { time: time }),
                        memo: { i: iteration * length + i + 1 },
                    };
                }
            }
        }
    };
}
exports.loopedEventListIterator = loopedEventListIterator;
//# sourceMappingURL=iterators.js.map