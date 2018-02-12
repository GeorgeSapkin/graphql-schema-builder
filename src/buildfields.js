'use strict';

const {
  ok: assert,
  deepStrictEqual
} = require('assert');

const {
  getQLType
} = require('./getqltype');

const {
  memoize
} = require('./memoize');

const {
  types
} = require('./types');

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

  return Object.getOwnPropertyNames(_fields).map(x => {
    const fieldData = _fields[x];

    const type = (() => {
      // if fieldData is an object, not an array and doesn't have type then
      // assume it's a subtype

      if (fieldData instanceof Object &&
        !Array.isArray(fieldData) &&
        fieldData !== Number &&
        fieldData !== String &&
        fieldData !== types.Mixed &&
        fieldData !== types.ObjectId &&
        fieldData.type == null
      ) {
        const existingType = getExistingType(x);
        const fields = _buildFields(fieldData, {
          buildSubType,
          getExistingType,
          resolvers
        });

        if (existingType != null) {
          const existingFields = existingType._typeConfig.fields;

          deepStrictEqual(fields, existingFields,
            `Subtypes' fields with same name \`${x}\` have to match`
          );

          return existingType;
        }
        else
          return buildSubType({ name: x, fields });
      }
      else if (fieldData.type != null)
      // figure out type based on type field
        return getQLType(graphql)(getExistingType, fieldData);
      else
      // figure out type based fieldData
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
