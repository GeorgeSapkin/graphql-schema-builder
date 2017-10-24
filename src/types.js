'use strict';

const types = Object.freeze({
  Mixed:    Object.freeze({ inspect: () => 'Mixed' }),
  ObjectId: Object.freeze({ inspect: () => 'ObjectId' })
});

module.exports = {
  types
};
