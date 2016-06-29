'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});
function wrap(fn) {
  return function wrapped() {
    for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
      args[_key] = arguments[_key];
    }

    return new Promise(function (resolve) {
      resolve(fn.apply(undefined, args));
    });
  };
}

function delay(timeout) {
  return new Promise(function (resolve) {
    return setTimeout(resolve, timeout);
  });
}

function doWhilst(action, condition) {
  var _ref = arguments.length <= 2 || arguments[2] === undefined ? {} : arguments[2];

  var _ref$loopTimeout = _ref.loopTimeout;
  var loopTimeout = _ref$loopTimeout === undefined ? 0 : _ref$loopTimeout;
  var _ref$maxRetries = _ref.maxRetries;
  var maxRetries = _ref$maxRetries === undefined ? 0 : _ref$maxRetries;

  var tries = 0;
  var wrappedAction = wrap(function () {
    tries += 1;

    if (maxRetries > 0 && tries > maxRetries) {
      return Promise.reject(new Error('max retries reached'));
    }

    if (loopTimeout > 0 && tries > 1) {
      return delay(loopTimeout).then(action);
    }

    return action();
  });

  function loop() {
    return wrappedAction().then(function (result) {
      if (condition(result)) {
        return loop();
      }

      return result;
    });
  }

  return loop();
}

exports['default'] = doWhilst;
module.exports = exports['default'];