"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = intern;

/**
  Strongly hint runtimes to intern the provided string.

  When do I need to use this function?

  For the most part, never. Pre-mature optimization is bad, and often the
  runtime does exactly what you need it to, and more often the trade-off isn't
  worth it.

  Why?

  Runtimes store strings in at least 2 different representations:
  Ropes and Symbols (interned strings). The Rope provides a memory efficient
  data-structure for strings created from concatenation or some other string
  manipulation like splitting.

  Unfortunately checking equality of different ropes can be quite costly as
  runtimes must resort to clever string comparison algorithms. These
  algorithms typically cost in proportion to the length of the string.
  Luckily, this is where the Symbols (interned strings) shine. As Symbols are
  unique by their string content, equality checks can be done by pointer
  comparison.

  How do I know if my string is a rope or symbol?

  Typically (warning general sweeping statement, but truthy in runtimes at
  present) static strings created as part of the JS source are interned.
  Strings often used for comparisons can be interned at runtime if some
  criteria are met.  One of these criteria can be the size of the entire rope.
  For example, in chrome 38 a rope longer then 12 characters will not
  intern, nor will segments of that rope.

  Some numbers: http://jsperf.com/eval-vs-keys/8

  Known Trick™

  @private
  @return {String} interned version of the provided string
*/
function intern(str) {
  let obj = {};
  obj[str] = 1;

  for (let key in obj) {
    if (key === str) {
      return key;
    }
  }

  return str;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL2ludGVybi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7Ozs7O0FBQUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXVDYyxTQUFBLE1BQUEsQ0FBQSxHQUFBLEVBQTRCO0FBQ3hDLE1BQUksR0FBRyxHQUFQLEVBQUE7QUFDQSxFQUFBLEdBQUcsQ0FBSCxHQUFHLENBQUgsR0FBQSxDQUFBOztBQUNBLE9BQUssSUFBTCxHQUFBLElBQUEsR0FBQSxFQUFxQjtBQUNuQixRQUFJLEdBQUcsS0FBUCxHQUFBLEVBQWlCO0FBQ2YsYUFBQSxHQUFBO0FBQ0Q7QUFDRjs7QUFDRCxTQUFBLEdBQUE7QUFDRCIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICBTdHJvbmdseSBoaW50IHJ1bnRpbWVzIHRvIGludGVybiB0aGUgcHJvdmlkZWQgc3RyaW5nLlxuXG4gIFdoZW4gZG8gSSBuZWVkIHRvIHVzZSB0aGlzIGZ1bmN0aW9uP1xuXG4gIEZvciB0aGUgbW9zdCBwYXJ0LCBuZXZlci4gUHJlLW1hdHVyZSBvcHRpbWl6YXRpb24gaXMgYmFkLCBhbmQgb2Z0ZW4gdGhlXG4gIHJ1bnRpbWUgZG9lcyBleGFjdGx5IHdoYXQgeW91IG5lZWQgaXQgdG8sIGFuZCBtb3JlIG9mdGVuIHRoZSB0cmFkZS1vZmYgaXNuJ3RcbiAgd29ydGggaXQuXG5cbiAgV2h5P1xuXG4gIFJ1bnRpbWVzIHN0b3JlIHN0cmluZ3MgaW4gYXQgbGVhc3QgMiBkaWZmZXJlbnQgcmVwcmVzZW50YXRpb25zOlxuICBSb3BlcyBhbmQgU3ltYm9scyAoaW50ZXJuZWQgc3RyaW5ncykuIFRoZSBSb3BlIHByb3ZpZGVzIGEgbWVtb3J5IGVmZmljaWVudFxuICBkYXRhLXN0cnVjdHVyZSBmb3Igc3RyaW5ncyBjcmVhdGVkIGZyb20gY29uY2F0ZW5hdGlvbiBvciBzb21lIG90aGVyIHN0cmluZ1xuICBtYW5pcHVsYXRpb24gbGlrZSBzcGxpdHRpbmcuXG5cbiAgVW5mb3J0dW5hdGVseSBjaGVja2luZyBlcXVhbGl0eSBvZiBkaWZmZXJlbnQgcm9wZXMgY2FuIGJlIHF1aXRlIGNvc3RseSBhc1xuICBydW50aW1lcyBtdXN0IHJlc29ydCB0byBjbGV2ZXIgc3RyaW5nIGNvbXBhcmlzb24gYWxnb3JpdGhtcy4gVGhlc2VcbiAgYWxnb3JpdGhtcyB0eXBpY2FsbHkgY29zdCBpbiBwcm9wb3J0aW9uIHRvIHRoZSBsZW5ndGggb2YgdGhlIHN0cmluZy5cbiAgTHVja2lseSwgdGhpcyBpcyB3aGVyZSB0aGUgU3ltYm9scyAoaW50ZXJuZWQgc3RyaW5ncykgc2hpbmUuIEFzIFN5bWJvbHMgYXJlXG4gIHVuaXF1ZSBieSB0aGVpciBzdHJpbmcgY29udGVudCwgZXF1YWxpdHkgY2hlY2tzIGNhbiBiZSBkb25lIGJ5IHBvaW50ZXJcbiAgY29tcGFyaXNvbi5cblxuICBIb3cgZG8gSSBrbm93IGlmIG15IHN0cmluZyBpcyBhIHJvcGUgb3Igc3ltYm9sP1xuXG4gIFR5cGljYWxseSAod2FybmluZyBnZW5lcmFsIHN3ZWVwaW5nIHN0YXRlbWVudCwgYnV0IHRydXRoeSBpbiBydW50aW1lcyBhdFxuICBwcmVzZW50KSBzdGF0aWMgc3RyaW5ncyBjcmVhdGVkIGFzIHBhcnQgb2YgdGhlIEpTIHNvdXJjZSBhcmUgaW50ZXJuZWQuXG4gIFN0cmluZ3Mgb2Z0ZW4gdXNlZCBmb3IgY29tcGFyaXNvbnMgY2FuIGJlIGludGVybmVkIGF0IHJ1bnRpbWUgaWYgc29tZVxuICBjcml0ZXJpYSBhcmUgbWV0LiAgT25lIG9mIHRoZXNlIGNyaXRlcmlhIGNhbiBiZSB0aGUgc2l6ZSBvZiB0aGUgZW50aXJlIHJvcGUuXG4gIEZvciBleGFtcGxlLCBpbiBjaHJvbWUgMzggYSByb3BlIGxvbmdlciB0aGVuIDEyIGNoYXJhY3RlcnMgd2lsbCBub3RcbiAgaW50ZXJuLCBub3Igd2lsbCBzZWdtZW50cyBvZiB0aGF0IHJvcGUuXG5cbiAgU29tZSBudW1iZXJzOiBodHRwOi8vanNwZXJmLmNvbS9ldmFsLXZzLWtleXMvOFxuXG4gIEtub3duIFRyaWNr4oSiXG5cbiAgQHByaXZhdGVcbiAgQHJldHVybiB7U3RyaW5nfSBpbnRlcm5lZCB2ZXJzaW9uIG9mIHRoZSBwcm92aWRlZCBzdHJpbmdcbiovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBpbnRlcm4oc3RyOiBzdHJpbmcpOiBzdHJpbmcge1xuICBsZXQgb2JqOiBSZWNvcmQ8c3RyaW5nLCBudW1iZXI+ID0ge307XG4gIG9ialtzdHJdID0gMTtcbiAgZm9yIChsZXQga2V5IGluIG9iaikge1xuICAgIGlmIChrZXkgPT09IHN0cikge1xuICAgICAgcmV0dXJuIGtleTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIHN0cjtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=