function wrap(fn) {
  return function wrapped(...args) {
    return new Promise((resolve) => {
      resolve(fn(...args));
    });
  };
}

function delay(timeout) {
  return new Promise((resolve) => setTimeout(resolve, timeout));
}

function doWhilst(action, condition, { loopTimeout = 0, maxRetries = 0 } = {}) {
  let tries = 0;
  const wrappedAction = wrap(function () {
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
    return wrappedAction()
      .then((result) => {
        if (condition(result)) {
          return loop();
        }

        return result;
      });
  }

  return loop();
}

export default doWhilst;
