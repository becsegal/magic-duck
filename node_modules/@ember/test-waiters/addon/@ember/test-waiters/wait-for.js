import { DEBUG } from '@glimmer/env';
import waitForPromise from './wait-for-promise';
import buildWaiter from './build-waiter';
export default function waitFor(...args) {
  let isFunction = args.length < 3;

  if (isFunction) {
    let [fn, label] = args;
    return wrapFunction(fn, label);
  } else {
    let [,, descriptor, label] = args;

    if (!DEBUG) {
      return descriptor;
    }

    let fn = descriptor.value;
    descriptor.value = wrapFunction(fn, label);
    return descriptor;
  }
}

function wrapFunction(fn, label) {
  if (!DEBUG) {
    return fn;
  }

  return function (...args) {
    let result = fn.call(this, ...args);

    if (isThenable(result)) {
      return waitForPromise(result, label);
    } else if (isGenerator(result)) {
      return waitForGenerator(result, label);
    } else {
      return result;
    }
  };
}

function isThenable(maybePromise) {
  let type = typeof maybePromise;
  return (maybePromise !== null && type === 'object' || type === 'function') && typeof maybePromise.then === 'function';
}

function isGenerator(maybeGenerator) {
  // Because we don't have Symbol.iterator in IE11
  return typeof maybeGenerator.next === 'function' && typeof maybeGenerator.return === 'function' && typeof maybeGenerator.throw === 'function';
}

const GENERATOR_WAITER = buildWaiter('@ember/test-waiters:generator-waiter');

function waitForGenerator(generator, label) {
  GENERATOR_WAITER.beginAsync(generator, label);
  let isWaiting = true;

  function stopWaiting() {
    if (isWaiting) {
      GENERATOR_WAITER.endAsync(generator);
      isWaiting = false;
    }
  }

  return {
    next(...args) {
      let hasErrored = true;

      try {
        let val = generator.next(...args);
        hasErrored = false;

        if (val.done) {
          stopWaiting();
        }

        return val;
      } finally {
        // If generator.next() throws, we need to stop waiting. But if we catch
        // and re-throw exceptions, it could move the location from which the
        // uncaught exception is thrown, interfering with the developer
        // debugging experience if they have break-on-exceptions enabled. So we
        // use a boolean flag and a finally block to emulate a catch block.
        if (hasErrored) {
          stopWaiting();
        }
      }
    },

    return(...args) {
      stopWaiting();
      return generator.return(...args);
    },

    throw(...args) {
      stopWaiting();
      return generator.throw(...args);
    }

  };
}