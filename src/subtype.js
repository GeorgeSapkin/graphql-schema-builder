'use strict';

const {
  types
} = require('./types');

// if type definition is an object, not an array and doesn't have type then
// assume it's a subtype
const _isTypeDefinition = def =>
  def instanceof Object &&
  typeof def !== 'function' &&
  !Array.isArray(def) &&
  def !== Number &&
  def !== String &&
  def !== types.Mixed &&
  def !== types.ObjectId &&
  def.type == null;

const isSubType = fieldData =>
  _isTypeDefinition(fieldData) || _isTypeDefinition(fieldData.type);

const getSubType = fieldData => {
  if (
    isSubType(fieldData) ||
    (Array.isArray(fieldData) && isSubType(fieldData[0]))
  )
    return fieldData;

  if (Array.isArray(fieldData.type) && isSubType(fieldData.type[0]))
    return fieldData.type;

  return null;
};

module.exports = {
  getSubType
};
