'use strict';

const {
  ok: assert,
  deepStrictEqual
} = require('assert');

const {
  getQLType
} = require('./getqltype');

const {
  getSubType
} = require('./subtype');

const {
  memoize
} = require('./memoize');

const {
  types
} = require('./types');

// Uppercase the first letter and remove final 's' if there is any
// TODO: handle edge cases
const getSubTypeName = name =>
  `${name[0].toUpperCase()}${name.slice(1)}`.replace(/s\b/, '');

const getMatchingFields = fields => Object.entries(fields).reduce(
  (obj, [k, v]) => {
    obj[k] = { type: v.type };
    return obj;
  }, {}
);

const buildFields = graphql => function _buildFields(fields, {
  buildSubType    = x => new graphql.GraphQLInputObjectType(x),
  getExistingType = () => {},
  resolvers       = null
} = {}) {
  assert(fields != null, 'fields must be set');
  assert(buildSubType instanceof Function, 'buildSubType must be a function');
  assert(getExistingType instanceof Function,
    'getExistingType must be a function'
  );

  const _fields = (fields instanceof Function) ? fields(types) : fields;

  const buildSubFields = (fieldData, name) => {
    // build fields of subtypes recursively
    const fields = _buildFields(fieldData, {
      buildSubType,
      getExistingType,
      resolvers
    });

    // if a type of that name already exists, check if fields are consistent
    const existingType = getExistingType(name);
    if (existingType != null) {
      // pick only relevant type properties for comparison
      // NB: is not recursive, so expects subtype to be one-level deep
      const _existingFields = getMatchingFields(
        existingType._fields instanceof Function
          ? existingType._fields()
          : existingType._fields
      );
      const __fields = getMatchingFields(fields);

      deepStrictEqual(__fields, _existingFields,
        `Subtypes' fields with same name \`${name}\` have to match`
      );

      return existingType;
    }
    else
      return buildSubType({ name, fields });
  };

  return Object.getOwnPropertyNames(_fields).map(x => {
    const fieldData = _fields[x];

    // assume objects without a type property to be subtypes
    const subType = getSubType(fieldData);

    const type = (() => {
      if (subType) {
        const name = getSubTypeName(x);
        if (!Array.isArray(subType)) {
          return buildSubFields(subType, name);
        }
        else {
          // if the subtype is enclosed in an array, build a GraphQLList
          // NB: the keys for arrays of subtypes are assumed to be consistent
          // with the name of the subtype, e.g. assets: [Asset]
          const _type = buildSubFields(subType[0], name);

          return new graphql.GraphQLList(
            fieldData.required === false
              ? _type
              : new graphql.GraphQLNonNull(_type)
          );
        }
      }
      else if (fieldData.type != null)
      // figure out type based on type field
        return getQLType(graphql)(getExistingType, fieldData);
      else
      // figure out type based on fieldData
        return getQLType(graphql)(getExistingType, { type: fieldData });
    })();

    const details = { type };

    if (fieldData.description != null)
      details.description = fieldData.description;

    if (resolvers != null && resolvers[x] != null) {
      // resolver can be either a function or an object
      // if it's an object then it can have args and must have resolve
      // args has the same format as a schema

      const resolver = resolvers[x];

      if (resolver instanceof Function) {
        details.resolve = resolver;
      }
      else { // resolver is an object
        assert(resolver.resolve instanceof Function,
          'resolve must be a function when resolver is an object'
        );

        details.resolve = resolver.resolve;

        // if resolver args are set process them as schema fields
        if (resolver.args != null)
          details.args = _buildFields(resolver.args, {
            buildSubType,
            getExistingType
          });
      }
    }

    return { [x]: details };
  }).reduce((a, b) => ({ ...a, ...b }), {});
};

module.exports = {
  buildFields: memoize(buildFields)
};
