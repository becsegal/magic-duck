function _createForOfIteratorHelperLoose(o, allowArrayLike) { var it; if (typeof Symbol === "undefined" || o[Symbol.iterator] == null) { if (Array.isArray(o) || (it = _unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; return function () { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } it = o[Symbol.iterator](); return it.next.bind(it); }

function _unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return _arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen); }

function _arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) { arr2[i] = arr[i]; } return arr2; }

export function isPresent(list) {
  return list.length > 0;
}
export function ifPresent(list, ifPresent, otherwise) {
  if (isPresent(list)) {
    return ifPresent(list);
  } else {
    return otherwise();
  }
}
export function toPresentOption(list) {
  if (isPresent(list)) {
    return list;
  } else {
    return null;
  }
}
export function assertPresent(list, message) {
  if (message === void 0) {
    message = "unexpected empty list";
  }

  if (!isPresent(list)) {
    throw new Error(message);
  }
}
export function mapPresent(list, callback) {
  if (list === null) {
    return null;
  }

  var out = [];

  for (var _iterator = _createForOfIteratorHelperLoose(list), _step; !(_step = _iterator()).done;) {
    var item = _step.value;
    out.push(callback(item));
  }

  return out;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3V0aWwvbGliL3ByZXNlbnQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBRUEsT0FBTSxTQUFBLFNBQUEsQ0FBQSxJQUFBLEVBQXlDO0FBQzdDLFNBQU8sSUFBSSxDQUFKLE1BQUEsR0FBUCxDQUFBO0FBQ0Q7QUFFRCxPQUFNLFNBQUEsU0FBQSxDQUFBLElBQUEsRUFBQSxTQUFBLEVBQUEsU0FBQSxFQUdjO0FBRWxCLE1BQUksU0FBUyxDQUFiLElBQWEsQ0FBYixFQUFxQjtBQUNuQixXQUFPLFNBQVMsQ0FBaEIsSUFBZ0IsQ0FBaEI7QUFERixHQUFBLE1BRU87QUFDTCxXQUFPLFNBQVAsRUFBQTtBQUNEO0FBQ0Y7QUFFRCxPQUFNLFNBQUEsZUFBQSxDQUFBLElBQUEsRUFBc0M7QUFDMUMsTUFBSSxTQUFTLENBQWIsSUFBYSxDQUFiLEVBQXFCO0FBQ25CLFdBQUEsSUFBQTtBQURGLEdBQUEsTUFFTztBQUNMLFdBQUEsSUFBQTtBQUNEO0FBQ0Y7QUFFRCxPQUFNLFNBQUEsYUFBQSxDQUFBLElBQUEsRUFBQSxPQUFBLEVBRTZCO0FBQUEsTUFGN0IsT0FFNkI7QUFGN0IsSUFBQSxPQUU2QjtBQUFBOztBQUVqQyxNQUFJLENBQUMsU0FBUyxDQUFkLElBQWMsQ0FBZCxFQUFzQjtBQUNwQixVQUFNLElBQUEsS0FBQSxDQUFOLE9BQU0sQ0FBTjtBQUNEO0FBQ0Y7QUFPRCxPQUFNLFNBQUEsVUFBQSxDQUFBLElBQUEsRUFBQSxRQUFBLEVBRXFCO0FBRXpCLE1BQUksSUFBSSxLQUFSLElBQUEsRUFBbUI7QUFDakIsV0FBQSxJQUFBO0FBQ0Q7O0FBQ0QsTUFBSSxHQUFHLEdBQVAsRUFBQTs7QUFFQSx1REFBQSxJQUFBLHdDQUF1QjtBQUFBLFFBQXZCLElBQXVCO0FBQ3JCLElBQUEsR0FBRyxDQUFILElBQUEsQ0FBUyxRQUFRLENBQWpCLElBQWlCLENBQWpCO0FBQ0Q7O0FBRUQsU0FBQSxHQUFBO0FBQ0QiLCJzb3VyY2VzQ29udGVudCI6WyJpbXBvcnQgeyBPcHRpb24sIFByZXNlbnRBcnJheSB9IGZyb20gJ0BnbGltbWVyL2ludGVyZmFjZXMnO1xuXG5leHBvcnQgZnVuY3Rpb24gaXNQcmVzZW50PFQ+KGxpc3Q6IHJlYWRvbmx5IFRbXSk6IGxpc3QgaXMgUHJlc2VudEFycmF5PFQ+IHtcbiAgcmV0dXJuIGxpc3QubGVuZ3RoID4gMDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGlmUHJlc2VudDxULCBVLCBWPihcbiAgbGlzdDogVFtdLFxuICBpZlByZXNlbnQ6IChpbnB1dDogUHJlc2VudEFycmF5PFQ+KSA9PiBVLFxuICBvdGhlcndpc2U6ICgpID0+IFZcbik6IFUgfCBWIHtcbiAgaWYgKGlzUHJlc2VudChsaXN0KSkge1xuICAgIHJldHVybiBpZlByZXNlbnQobGlzdCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG90aGVyd2lzZSgpO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB0b1ByZXNlbnRPcHRpb248VD4obGlzdDogVFtdKTogT3B0aW9uPFByZXNlbnRBcnJheTxUPj4ge1xuICBpZiAoaXNQcmVzZW50KGxpc3QpKSB7XG4gICAgcmV0dXJuIGxpc3Q7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGFzc2VydFByZXNlbnQ8VD4oXG4gIGxpc3Q6IFRbXSxcbiAgbWVzc2FnZSA9IGB1bmV4cGVjdGVkIGVtcHR5IGxpc3RgXG4pOiBhc3NlcnRzIGxpc3QgaXMgUHJlc2VudEFycmF5PFQ+IHtcbiAgaWYgKCFpc1ByZXNlbnQobGlzdCkpIHtcbiAgICB0aHJvdyBuZXcgRXJyb3IobWVzc2FnZSk7XG4gIH1cbn1cblxuZXhwb3J0IGZ1bmN0aW9uIG1hcFByZXNlbnQ8VCwgVT4obGlzdDogUHJlc2VudEFycmF5PFQ+LCBjYWxsYmFjazogKGlucHV0OiBUKSA9PiBVKTogUHJlc2VudEFycmF5PFU+O1xuZXhwb3J0IGZ1bmN0aW9uIG1hcFByZXNlbnQ8VCwgVT4oXG4gIGxpc3Q6IFByZXNlbnRBcnJheTxUPiB8IG51bGwsXG4gIGNhbGxiYWNrOiAoaW5wdXQ6IFQpID0+IFVcbik6IFByZXNlbnRBcnJheTxVPiB8IG51bGw7XG5leHBvcnQgZnVuY3Rpb24gbWFwUHJlc2VudDxULCBVPihcbiAgbGlzdDogUHJlc2VudEFycmF5PFQ+IHwgbnVsbCxcbiAgY2FsbGJhY2s6IChpbnB1dDogVCkgPT4gVVxuKTogUHJlc2VudEFycmF5PFU+IHwgbnVsbCB7XG4gIGlmIChsaXN0ID09PSBudWxsKSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgbGV0IG91dDogVVtdID0gW107XG5cbiAgZm9yIChsZXQgaXRlbSBvZiBsaXN0KSB7XG4gICAgb3V0LnB1c2goY2FsbGJhY2soaXRlbSkpO1xuICB9XG5cbiAgcmV0dXJuIG91dCBhcyBQcmVzZW50QXJyYXk8VT47XG59XG4iXSwic291cmNlUm9vdCI6IiJ9