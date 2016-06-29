import assert from 'assert';
import promiseDoWhilst from '../lib';

describe('promise-do-whilst', function () {
  it('should "do" loop 5 times', function () {
    let count = 0;
    return promiseDoWhilst(() => count++, () => count < 5)
      .then(() => {
        assert(count === 5, 'did not log 5 "do" loops');
      });
  });

  it('should "do" once but not loop', function () {
    let count = 0;
    return promiseDoWhilst(() => count++, () => count < 0)
      .then(() => {
        assert(count === 1, 'did not "do" only once');
      });
  });

  it('should pass the result of "action" to "condition"', function () {
    let count = 0;
    return promiseDoWhilst(() => ++count, (counter) => {
      assert(typeof counter === 'number', 'did not pass the "action" result to "condition"');
      assert(counter === 1, 'did not pass the correct result to "condition"');
      return false;
    });
  });

  it('should pass the result of "action" to the following "then"', function () {
    let count = 0;
    return promiseDoWhilst(() => ++count, () => false)
      .then((counter) => {
        assert(typeof counter === 'number', 'did not pass the "action" result to "then"');
        assert(counter === 1, 'did not pass the correct result to "then"');
      });
  });

  it('should yield the result of "action" as a promise', function () {
    return promiseDoWhilst(() => {
      return Promise.resolve({ data: [1, 2, 3] }); // get some data from an async call
    }, (result) => {
      assert(typeof result === 'object', 'did not pass the "action" result');
      assert.deepStrictEqual(result, { data: [1, 2, 3] }, 'did not pass the correct "action" result to "condition"');
      return false;
    });
  });

  it('should accept a `maxRetries` option to limit the amount of checks', function () {
    let error;
    return promiseDoWhilst(() => [1, 2, 3], () => true, { maxRetries: 1 })
      .catch((err) => {
        error = err;
      }).then(() => {
        assert(typeof error === 'object', '"maxRetries" did not stop the iteration');
      });
  });

  it('should accept a `loopTimeout` option to delay all but the first call', function () {
    let counter = 0;
    const p = promiseDoWhilst(() => counter++, () => counter < 4, { loopTimeout: 5 })
      .then(() => {
        assert.equal(counter, 4, 'counter condition failed');
      });

    // first iteration starts immediately
    assert.equal(counter, 1, 'first iteration did not start immediately');

    // second iteration starts delayed
    setTimeout(() => {
      assert.equal(counter, 2, 'second iteration did not start with a delay');

      // third iteration starts delayed
      setTimeout(() => assert.equal(counter, 3, 'third iteration did not start with a delay'), 7);
    }, 7);

    return p;
  });
});
