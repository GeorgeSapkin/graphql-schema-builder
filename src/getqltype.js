'use strict';

const {
  ok: assert
} = require('assert');

const {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} = require('graphql');

const {
  GraphQLDateTime
} = require('graphql-iso-date');

const {
  GraphQLJSON
} = require('./jsontype');

const {
  types: {
    Mixed,
    ObjectId
  }
} = require('./types');

function getQLType(getExistingType, { type, ref, required = true }) {
  assert(getExistingType instanceof Function,
    'getExistingType must be a function'
  );
  assert(type != null, 'type must be set');

  if (type === String) {
    return required ? new GraphQLNonNull(GraphQLString) : GraphQLString;
  }
  else if (type === Number) {
    return required ? new GraphQLNonNull(GraphQLFloat) : GraphQLFloat;
  }
  else if (type === Date) {
    return required ? new GraphQLNonNull(GraphQLDateTime) : GraphQLDateTime;
  }
  else if (type === Boolean) {
    return required ? new GraphQLNonNull(GraphQLBoolean) : GraphQLBoolean;
  }
  else if (type === Mixed) {
    return required ? new GraphQLNonNull(GraphQLJSON) : GraphQLJSON;
  }
  else if (type === ObjectId) {
    const refType = getExistingType(ref) || GraphQLID;
    return required ? new GraphQLNonNull(refType) : refType;
  }
  else if (typeof type === 'string') {
    const refType = getExistingType(type);
    assert(refType, `Failed to find existing type ${type}`);
    return required ? new GraphQLNonNull(refType) : refType;
  }
  else if (Array.isArray(type)) {
    const subType = type[0];

    if (subType.type != null) {
      const listType = new GraphQLList(getQLType(
        getExistingType, subType));
      return required ? new GraphQLNonNull(listType) : listType;
    }
    else {
      const listType = new GraphQLList(getQLType(getExistingType, {
        type: subType,
        ref
      }));
      return required ? new GraphQLNonNull(listType) : listType;
    }
  }
  else
    return null;
}

module.exports = {
  getQLType
};
