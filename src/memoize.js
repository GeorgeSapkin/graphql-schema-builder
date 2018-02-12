'use strict';

function memoize(fn) {
  const map = new Map();
  return (...args) => {
    const key = JSON.stringify(args);

    if (map.has(key))
      return map.get(key);

    const value = fn(...args);
    map.set(key, value);
    return value;
  };
}

module.exports = {
  memoize
};
