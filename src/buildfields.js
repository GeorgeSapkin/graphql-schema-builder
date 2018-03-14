'use strict';

const {
  ok: assert,
  deepStrictEqual
} = require('assert');

const {
  getQLType
} = require('./getqltype');

const {
  isSubType
} = require('./issubtype');

const {
  memoize
} = require('./memoize');

const {
  types
} = require('./types');

const getSubTypeName = name =>
  `${name[0].toUpperCase()}${name.slice(1)}`.replace(/s\b/, '');

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
    const existingType = getExistingType(name);
    const fields = _buildFields(fieldData, {
      buildSubType,
      getExistingType,
      resolvers
    });

    if (existingType != null) {
      const existingFields = existingType._typeConfig.fields;

      deepStrictEqual(fields, existingFields,
        `Subtypes' fields with same name \`${name}\` have to match`
      );

      return existingType;
    }
    else
      return buildSubType({ name, fields });
  };

  return Object.getOwnPropertyNames(_fields).map(x => {
    const fieldData = _fields[x];

    const type = (() => {
      if (isSubType(fieldData) || (fieldData.type && isSubType(fieldData.type)))
        return buildSubFields(fieldData, x);
      else if (
        fieldData.type &&
        Array.isArray(fieldData.type) &&
        isSubType(fieldData.type[0])
      ) {
        const name = getSubTypeName(x);
        const _type = buildSubFields(fieldData.type[0], name);
        return new graphql.GraphQLList(
          fieldData.required === false
            ? _type
            : new graphql.GraphQLNonNull(_type)
        );
      }
      else if (Array.isArray(fieldData) && isSubType(fieldData[0])) {
        const name = getSubTypeName(x);
        const _type = buildSubFields(fieldData[0], name);
        return new graphql.GraphQLList(new graphql.GraphQLNonNull(_type));
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
