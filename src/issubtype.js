'use strict';

const {
  types
} = require('./types');

// if fieldData is an object, not an array and doesn't have type then assume
// it's a subtype
const isSubType = fieldData =>
  fieldData instanceof Object &&
  typeof fieldData !== 'function' &&
  !Array.isArray(fieldData) &&
  fieldData !== Number &&
  fieldData !== String &&
  fieldData !== types.Mixed &&
  fieldData !== types.ObjectId &&
  fieldData.type == null;

module.exports = {
  isSubType
};
