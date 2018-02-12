'use strict';

const {
  ok: assert
} = require('assert');

const {
  GraphQLDateTime
} = require('graphql-iso-date');

const {
  GraphQLJSON
} = require('./jsontype');

const {
  memoize
} = require('./memoize');

const {
  types: {
    Mixed,
    ObjectId
  }
} = require('./types');

const getQLType = graphql => function _getQLType(
  getExistingType, { type, ref, required = true }
) {
  assert(getExistingType instanceof Function,
    'getExistingType must be a function'
  );
  assert(type != null, 'type must be set');

  const graphQlType = (() => {
    if (type === String)
      return graphql.GraphQLString;
    else if (type === Number)
      return graphql.GraphQLFloat;
    else if (type === Date)
      return GraphQLDateTime;
    else if (type === Boolean)
      return graphql.GraphQLBoolean;
    else if (type === Mixed)
      return GraphQLJSON(graphql);
    else if (type === ObjectId)
      return getExistingType(ref) || graphql.GraphQLID;
    else if (typeof type === 'string') {
      const refType = getExistingType(type);
      assert(refType, `Failed to find existing type ${type}`);
      return refType;
    }
    else if (Array.isArray(type))
      return new graphql.GraphQLList(_getQLType(
        getExistingType, type[0].type != null
          ? type[0]
          : {
            type: type[0],
            ref
          }
      ));
    else
      return null;
  })();

  if (graphQlType == null)
    return null;

  return required ? new graphql.GraphQLNonNull(graphQlType) : graphQlType;
};

module.exports = {
  getQLType: memoize(getQLType)
};
