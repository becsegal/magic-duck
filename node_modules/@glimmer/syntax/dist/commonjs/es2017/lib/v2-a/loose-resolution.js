"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.SexpSyntaxContext = SexpSyntaxContext;
exports.ModifierSyntaxContext = ModifierSyntaxContext;
exports.BlockSyntaxContext = BlockSyntaxContext;
exports.ComponentSyntaxContext = ComponentSyntaxContext;
exports.AttrValueSyntaxContext = AttrValueSyntaxContext;
exports.AppendSyntaxContext = AppendSyntaxContext;

var ASTv2 = _interopRequireWildcard(require("./api"));

function _getRequireWildcardCache() { if (typeof WeakMap !== "function") return null; var cache = new WeakMap(); _getRequireWildcardCache = function () { return cache; }; return cache; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } if (obj === null || typeof obj !== "object" && typeof obj !== "function") { return { default: obj }; } var cache = _getRequireWildcardCache(); if (cache && cache.has(obj)) { return cache.get(obj); } var newObj = {}; var hasPropertyDescriptor = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = hasPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : null; if (desc && (desc.get || desc.set)) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } newObj.default = obj; if (cache) { cache.set(obj, newObj); } return newObj; }

function SexpSyntaxContext(node) {
  if (isSimpleCallee(node)) {
    return ASTv2.LooseModeResolution.namespaced("Helper"
    /* Helper */
    );
  } else {
    return null;
  }
}

function ModifierSyntaxContext(node) {
  if (isSimpleCallee(node)) {
    return ASTv2.LooseModeResolution.namespaced("Modifier"
    /* Modifier */
    );
  } else {
    return null;
  }
}

function BlockSyntaxContext(node) {
  if (isSimpleCallee(node)) {
    return ASTv2.LooseModeResolution.namespaced("Component"
    /* Component */
    );
  } else {
    return ASTv2.LooseModeResolution.fallback();
  }
}

function ComponentSyntaxContext(node) {
  if (isSimplePath(node)) {
    return ASTv2.LooseModeResolution.namespaced("Component"
    /* Component */
    , true);
  } else {
    return null;
  }
}
/**
 * This corresponds to append positions (text curlies or attribute
 * curlies). In strict mode, this also corresponds to arg curlies.
 */


function AttrValueSyntaxContext(node) {
  let isSimple = isSimpleCallee(node);
  let isInvoke = isInvokeNode(node);

  if (isSimple) {
    return isInvoke ? ASTv2.LooseModeResolution.namespaced("Helper"
    /* Helper */
    ) : ASTv2.LooseModeResolution.attr();
  } else {
    return isInvoke ? ASTv2.STRICT_RESOLUTION : ASTv2.LooseModeResolution.fallback();
  }
}
/**
 * This corresponds to append positions (text curlies or attribute
 * curlies). In strict mode, this also corresponds to arg curlies.
 */


function AppendSyntaxContext(node) {
  let isSimple = isSimpleCallee(node);
  let isInvoke = isInvokeNode(node);
  let trusting = node.trusting;

  if (isSimple) {
    return trusting ? ASTv2.LooseModeResolution.trustingAppend({
      invoke: isInvoke
    }) : ASTv2.LooseModeResolution.append({
      invoke: isInvoke
    });
  } else {
    return ASTv2.LooseModeResolution.fallback();
  }
} // UTILITIES

/**
 * A call node has a simple callee if its head is:
 *
 * - a `PathExpression`
 * - the `PathExpression`'s head is a `VarHead`
 * - it has no tail
 *
 * Simple heads:
 *
 * ```
 * {{x}}
 * {{x y}}
 * ```
 *
 * Not simple heads:
 *
 * ```
 * {{x.y}}
 * {{x.y z}}
 * {{@x}}
 * {{@x a}}
 * {{this}}
 * {{this a}}
 * ```
 */


function isSimpleCallee(node) {
  let path = node.path;
  return isSimplePath(path);
}

function isSimplePath(node) {
  if (node.type === 'PathExpression' && node.head.type === 'VarHead') {
    return node.tail.length === 0;
  } else {
    return false;
  }
}
/**
 * The call expression has at least one argument.
 */


function isInvokeNode(node) {
  return node.params.length > 0 || node.hash.pairs.length > 0;
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uLy4uL3BhY2thZ2VzL0BnbGltbWVyL3N5bnRheC9saWIvdjItYS9sb29zZS1yZXNvbHV0aW9uLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7OztBQUNBOzs7Ozs7QUFZTSxTQUFBLGlCQUFBLENBQUEsSUFBQSxFQUFxRDtBQUN6RCxNQUFJLGNBQWMsQ0FBbEIsSUFBa0IsQ0FBbEIsRUFBMEI7QUFDeEIsV0FBTyxLQUFLLENBQUwsbUJBQUEsQ0FBQSxVQUFBLENBQW9DO0FBQUE7QUFBcEMsS0FBUDtBQURGLEdBQUEsTUFFTztBQUNMLFdBQUEsSUFBQTtBQUNEO0FBQ0Y7O0FBRUssU0FBQSxxQkFBQSxDQUFBLElBQUEsRUFDZ0M7QUFFcEMsTUFBSSxjQUFjLENBQWxCLElBQWtCLENBQWxCLEVBQTBCO0FBQ3hCLFdBQU8sS0FBSyxDQUFMLG1CQUFBLENBQUEsVUFBQSxDQUFvQztBQUFBO0FBQXBDLEtBQVA7QUFERixHQUFBLE1BRU87QUFDTCxXQUFBLElBQUE7QUFDRDtBQUNGOztBQUVLLFNBQUEsa0JBQUEsQ0FBQSxJQUFBLEVBQXVEO0FBQzNELE1BQUksY0FBYyxDQUFsQixJQUFrQixDQUFsQixFQUEwQjtBQUN4QixXQUFPLEtBQUssQ0FBTCxtQkFBQSxDQUFBLFVBQUEsQ0FBb0M7QUFBQTtBQUFwQyxLQUFQO0FBREYsR0FBQSxNQUVPO0FBQ0wsV0FBTyxLQUFLLENBQUwsbUJBQUEsQ0FBUCxRQUFPLEVBQVA7QUFDRDtBQUNGOztBQUVLLFNBQUEsc0JBQUEsQ0FBQSxJQUFBLEVBQTJEO0FBQy9ELE1BQUksWUFBWSxDQUFoQixJQUFnQixDQUFoQixFQUF3QjtBQUN0QixXQUFPLEtBQUssQ0FBTCxtQkFBQSxDQUFBLFVBQUEsQ0FBb0M7QUFBQTtBQUFwQyxNQUFQLElBQU8sQ0FBUDtBQURGLEdBQUEsTUFFTztBQUNMLFdBQUEsSUFBQTtBQUNEO0FBQ0Y7QUFFRDs7Ozs7O0FBSU0sU0FBQSxzQkFBQSxDQUFBLElBQUEsRUFBOEQ7QUFDbEUsTUFBSSxRQUFRLEdBQUcsY0FBYyxDQUE3QixJQUE2QixDQUE3QjtBQUNBLE1BQUksUUFBUSxHQUFHLFlBQVksQ0FBM0IsSUFBMkIsQ0FBM0I7O0FBRUEsTUFBQSxRQUFBLEVBQWM7QUFDWixXQUFPLFFBQVEsR0FDWCxLQUFLLENBQUwsbUJBQUEsQ0FBQSxVQUFBLENBQW9DO0FBQUE7QUFBcEMsS0FEVyxHQUVYLEtBQUssQ0FBTCxtQkFBQSxDQUZKLElBRUksRUFGSjtBQURGLEdBQUEsTUFJTztBQUNMLFdBQU8sUUFBUSxHQUFHLEtBQUssQ0FBUixpQkFBQSxHQUE2QixLQUFLLENBQUwsbUJBQUEsQ0FBNUMsUUFBNEMsRUFBNUM7QUFDRDtBQUNGO0FBRUQ7Ozs7OztBQUlNLFNBQUEsbUJBQUEsQ0FBQSxJQUFBLEVBQTJEO0FBQy9ELE1BQUksUUFBUSxHQUFHLGNBQWMsQ0FBN0IsSUFBNkIsQ0FBN0I7QUFDQSxNQUFJLFFBQVEsR0FBRyxZQUFZLENBQTNCLElBQTJCLENBQTNCO0FBQ0EsTUFBSSxRQUFRLEdBQUcsSUFBSSxDQUFuQixRQUFBOztBQUVBLE1BQUEsUUFBQSxFQUFjO0FBQ1osV0FBTyxRQUFRLEdBQ1gsS0FBSyxDQUFMLG1CQUFBLENBQUEsY0FBQSxDQUF5QztBQUFFLE1BQUEsTUFBTSxFQUFFO0FBQVYsS0FBekMsQ0FEVyxHQUVYLEtBQUssQ0FBTCxtQkFBQSxDQUFBLE1BQUEsQ0FBaUM7QUFBRSxNQUFBLE1BQU0sRUFBRTtBQUFWLEtBQWpDLENBRko7QUFERixHQUFBLE1BSU87QUFDTCxXQUFPLEtBQUssQ0FBTCxtQkFBQSxDQUFQLFFBQU8sRUFBUDtBQUNEO0VBT0g7O0FBRUE7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQXlCQSxTQUFBLGNBQUEsQ0FBQSxJQUFBLEVBQTBDO0FBQ3hDLE1BQUksSUFBSSxHQUFHLElBQUksQ0FBZixJQUFBO0FBRUEsU0FBTyxZQUFZLENBQW5CLElBQW1CLENBQW5CO0FBQ0Q7O0FBRUQsU0FBQSxZQUFBLENBQUEsSUFBQSxFQUE0QztBQUMxQyxNQUFJLElBQUksQ0FBSixJQUFBLEtBQUEsZ0JBQUEsSUFBa0MsSUFBSSxDQUFKLElBQUEsQ0FBQSxJQUFBLEtBQXRDLFNBQUEsRUFBb0U7QUFDbEUsV0FBTyxJQUFJLENBQUosSUFBQSxDQUFBLE1BQUEsS0FBUCxDQUFBO0FBREYsR0FBQSxNQUVPO0FBQ0wsV0FBQSxLQUFBO0FBQ0Q7QUFDRjtBQUVEOzs7OztBQUdBLFNBQUEsWUFBQSxDQUFBLElBQUEsRUFBd0M7QUFDdEMsU0FBTyxJQUFJLENBQUosTUFBQSxDQUFBLE1BQUEsR0FBQSxDQUFBLElBQTBCLElBQUksQ0FBSixJQUFBLENBQUEsS0FBQSxDQUFBLE1BQUEsR0FBakMsQ0FBQTtBQUNEIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0ICogYXMgQVNUdjEgZnJvbSAnLi4vdjEvYXBpJztcbmltcG9ydCAqIGFzIEFTVHYyIGZyb20gJy4vYXBpJztcblxuZXhwb3J0IGludGVyZmFjZSBBc3RDYWxsUGFydHMge1xuICBwYXRoOiBBU1R2MS5FeHByZXNzaW9uO1xuICBwYXJhbXM6IEFTVHYxLkV4cHJlc3Npb25bXTtcbiAgaGFzaDogQVNUdjEuSGFzaDtcbn1cblxuZXhwb3J0IGludGVyZmFjZSBWYXJQYXRoIGV4dGVuZHMgQVNUdjEuUGF0aEV4cHJlc3Npb24ge1xuICBoZWFkOiBBU1R2MS5WYXJIZWFkO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gU2V4cFN5bnRheENvbnRleHQobm9kZTogQVNUdjEuU3ViRXhwcmVzc2lvbik6IEFTVHYyLkZyZWVWYXJSZXNvbHV0aW9uIHwgbnVsbCB7XG4gIGlmIChpc1NpbXBsZUNhbGxlZShub2RlKSkge1xuICAgIHJldHVybiBBU1R2Mi5Mb29zZU1vZGVSZXNvbHV0aW9uLm5hbWVzcGFjZWQoQVNUdjIuRnJlZVZhck5hbWVzcGFjZS5IZWxwZXIpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBudWxsO1xuICB9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBNb2RpZmllclN5bnRheENvbnRleHQoXG4gIG5vZGU6IEFTVHYxLkVsZW1lbnRNb2RpZmllclN0YXRlbWVudFxuKTogQVNUdjIuRnJlZVZhclJlc29sdXRpb24gfCBudWxsIHtcbiAgaWYgKGlzU2ltcGxlQ2FsbGVlKG5vZGUpKSB7XG4gICAgcmV0dXJuIEFTVHYyLkxvb3NlTW9kZVJlc29sdXRpb24ubmFtZXNwYWNlZChBU1R2Mi5GcmVlVmFyTmFtZXNwYWNlLk1vZGlmaWVyKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQmxvY2tTeW50YXhDb250ZXh0KG5vZGU6IEFTVHYxLkJsb2NrU3RhdGVtZW50KTogQVNUdjIuRnJlZVZhclJlc29sdXRpb24gfCBudWxsIHtcbiAgaWYgKGlzU2ltcGxlQ2FsbGVlKG5vZGUpKSB7XG4gICAgcmV0dXJuIEFTVHYyLkxvb3NlTW9kZVJlc29sdXRpb24ubmFtZXNwYWNlZChBU1R2Mi5GcmVlVmFyTmFtZXNwYWNlLkNvbXBvbmVudCk7XG4gIH0gZWxzZSB7XG4gICAgcmV0dXJuIEFTVHYyLkxvb3NlTW9kZVJlc29sdXRpb24uZmFsbGJhY2soKTtcbiAgfVxufVxuXG5leHBvcnQgZnVuY3Rpb24gQ29tcG9uZW50U3ludGF4Q29udGV4dChub2RlOiBBU1R2MS5QYXRoRXhwcmVzc2lvbik6IEFTVHYyLkZyZWVWYXJSZXNvbHV0aW9uIHwgbnVsbCB7XG4gIGlmIChpc1NpbXBsZVBhdGgobm9kZSkpIHtcbiAgICByZXR1cm4gQVNUdjIuTG9vc2VNb2RlUmVzb2x1dGlvbi5uYW1lc3BhY2VkKEFTVHYyLkZyZWVWYXJOYW1lc3BhY2UuQ29tcG9uZW50LCB0cnVlKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxufVxuXG4vKipcbiAqIFRoaXMgY29ycmVzcG9uZHMgdG8gYXBwZW5kIHBvc2l0aW9ucyAodGV4dCBjdXJsaWVzIG9yIGF0dHJpYnV0ZVxuICogY3VybGllcykuIEluIHN0cmljdCBtb2RlLCB0aGlzIGFsc28gY29ycmVzcG9uZHMgdG8gYXJnIGN1cmxpZXMuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBBdHRyVmFsdWVTeW50YXhDb250ZXh0KG5vZGU6IEFTVHYxLk11c3RhY2hlU3RhdGVtZW50KTogQVNUdjIuRnJlZVZhclJlc29sdXRpb24ge1xuICBsZXQgaXNTaW1wbGUgPSBpc1NpbXBsZUNhbGxlZShub2RlKTtcbiAgbGV0IGlzSW52b2tlID0gaXNJbnZva2VOb2RlKG5vZGUpO1xuXG4gIGlmIChpc1NpbXBsZSkge1xuICAgIHJldHVybiBpc0ludm9rZVxuICAgICAgPyBBU1R2Mi5Mb29zZU1vZGVSZXNvbHV0aW9uLm5hbWVzcGFjZWQoQVNUdjIuRnJlZVZhck5hbWVzcGFjZS5IZWxwZXIpXG4gICAgICA6IEFTVHYyLkxvb3NlTW9kZVJlc29sdXRpb24uYXR0cigpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBpc0ludm9rZSA/IEFTVHYyLlNUUklDVF9SRVNPTFVUSU9OIDogQVNUdjIuTG9vc2VNb2RlUmVzb2x1dGlvbi5mYWxsYmFjaygpO1xuICB9XG59XG5cbi8qKlxuICogVGhpcyBjb3JyZXNwb25kcyB0byBhcHBlbmQgcG9zaXRpb25zICh0ZXh0IGN1cmxpZXMgb3IgYXR0cmlidXRlXG4gKiBjdXJsaWVzKS4gSW4gc3RyaWN0IG1vZGUsIHRoaXMgYWxzbyBjb3JyZXNwb25kcyB0byBhcmcgY3VybGllcy5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIEFwcGVuZFN5bnRheENvbnRleHQobm9kZTogQVNUdjEuTXVzdGFjaGVTdGF0ZW1lbnQpOiBBU1R2Mi5GcmVlVmFyUmVzb2x1dGlvbiB7XG4gIGxldCBpc1NpbXBsZSA9IGlzU2ltcGxlQ2FsbGVlKG5vZGUpO1xuICBsZXQgaXNJbnZva2UgPSBpc0ludm9rZU5vZGUobm9kZSk7XG4gIGxldCB0cnVzdGluZyA9IG5vZGUudHJ1c3Rpbmc7XG5cbiAgaWYgKGlzU2ltcGxlKSB7XG4gICAgcmV0dXJuIHRydXN0aW5nXG4gICAgICA/IEFTVHYyLkxvb3NlTW9kZVJlc29sdXRpb24udHJ1c3RpbmdBcHBlbmQoeyBpbnZva2U6IGlzSW52b2tlIH0pXG4gICAgICA6IEFTVHYyLkxvb3NlTW9kZVJlc29sdXRpb24uYXBwZW5kKHsgaW52b2tlOiBpc0ludm9rZSB9KTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gQVNUdjIuTG9vc2VNb2RlUmVzb2x1dGlvbi5mYWxsYmFjaygpO1xuICB9XG59XG5cbmV4cG9ydCB0eXBlIFJlc29sdXRpb248UCBleHRlbmRzIEFzdENhbGxQYXJ0cyB8IEFTVHYxLlBhdGhFeHByZXNzaW9uPiA9IChcbiAgY2FsbDogUFxuKSA9PiBBU1R2Mi5GcmVlVmFyUmVzb2x1dGlvbiB8IG51bGw7XG5cbi8vIFVUSUxJVElFU1xuXG4vKipcbiAqIEEgY2FsbCBub2RlIGhhcyBhIHNpbXBsZSBjYWxsZWUgaWYgaXRzIGhlYWQgaXM6XG4gKlxuICogLSBhIGBQYXRoRXhwcmVzc2lvbmBcbiAqIC0gdGhlIGBQYXRoRXhwcmVzc2lvbmAncyBoZWFkIGlzIGEgYFZhckhlYWRgXG4gKiAtIGl0IGhhcyBubyB0YWlsXG4gKlxuICogU2ltcGxlIGhlYWRzOlxuICpcbiAqIGBgYFxuICoge3t4fX1cbiAqIHt7eCB5fX1cbiAqIGBgYFxuICpcbiAqIE5vdCBzaW1wbGUgaGVhZHM6XG4gKlxuICogYGBgXG4gKiB7e3gueX19XG4gKiB7e3gueSB6fX1cbiAqIHt7QHh9fVxuICoge3tAeCBhfX1cbiAqIHt7dGhpc319XG4gKiB7e3RoaXMgYX19XG4gKiBgYGBcbiAqL1xuZnVuY3Rpb24gaXNTaW1wbGVDYWxsZWUobm9kZTogQXN0Q2FsbFBhcnRzKTogYm9vbGVhbiB7XG4gIGxldCBwYXRoID0gbm9kZS5wYXRoO1xuXG4gIHJldHVybiBpc1NpbXBsZVBhdGgocGF0aCk7XG59XG5cbmZ1bmN0aW9uIGlzU2ltcGxlUGF0aChub2RlOiBBU1R2MS5FeHByZXNzaW9uKTogYm9vbGVhbiB7XG4gIGlmIChub2RlLnR5cGUgPT09ICdQYXRoRXhwcmVzc2lvbicgJiYgbm9kZS5oZWFkLnR5cGUgPT09ICdWYXJIZWFkJykge1xuICAgIHJldHVybiBub2RlLnRhaWwubGVuZ3RoID09PSAwO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBmYWxzZTtcbiAgfVxufVxuXG4vKipcbiAqIFRoZSBjYWxsIGV4cHJlc3Npb24gaGFzIGF0IGxlYXN0IG9uZSBhcmd1bWVudC5cbiAqL1xuZnVuY3Rpb24gaXNJbnZva2VOb2RlKG5vZGU6IEFzdENhbGxQYXJ0cyk6IGJvb2xlYW4ge1xuICByZXR1cm4gbm9kZS5wYXJhbXMubGVuZ3RoID4gMCB8fCBub2RlLmhhc2gucGFpcnMubGVuZ3RoID4gMDtcbn1cbiJdLCJzb3VyY2VSb290IjoiIn0=