'use strict';

const {
  ok: assert
} = require('assert');

const {
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLNonNull,
  GraphQLObjectType
} = require('graphql');

const {
  buildFields
} = require('./buildfields');

const {
  types
} = require('./types');

function buildType(typeSchema, {
  buildSubType    = x => new GraphQLInputObjectType(x),
  getExistingType = () => {},
  resolvers       = null
} = {}) {
  assert(typeSchema, 'typeSchema must be set');
  assert(typeSchema.name, 'typeSchema.name must be set');
  assert(getExistingType instanceof Function,
    'getExistingType must be a function');

  // fields is a function to resolve reference types dynamically
  function fields() {
    const dbFields = (() => {
      const fields        = typeSchema.fields;
      const dynamicFields = typeSchema.dynamicFields;

      if (dynamicFields == null)
        return (fields instanceof Function)
          ? fields(types)
          : fields;
      else
        return Object.assign(
          (fields instanceof Function)
            ? fields(types)
            : fields,
          (dynamicFields instanceof Function)
            ? dynamicFields(types)
            : dynamicFields
        );
    })();

    const _resolvers = resolvers != null
      ? resolvers[typeSchema.name]
      : null;

    const _fields = buildFields(dbFields, {
      buildSubType,
      getExistingType,

      resolvers: _resolvers
    });
    _fields.id = {
      type: new GraphQLNonNull(GraphQLID)
    };

    return _fields;
  }

  const outTypeSchema = {
    name: typeSchema.name,

    fields
  };

  if (typeSchema.description)
    outTypeSchema.description = typeSchema.description;

  return new GraphQLObjectType(outTypeSchema);
}

function buildSubType(schemaStore) {
  assert(schemaStore != null, 'schemaStore must be set');

  return ({ name, fields }) => {
    const newType = new GraphQLObjectType({ name, fields });
    schemaStore.set(name, newType);
    return newType;
  };
}

function buildTypes(schema, resolvers = null, getExistingType = null) {
  assert(schema != null, 'schema must be set');

  const domainTypeNames = Object.getOwnPropertyNames(schema);

  const storeMap = new Map();

  const _schemaStore = {
    get(key) {
      if (getExistingType instanceof Function)
        return getExistingType(key) || storeMap.get(key);
      else
        return storeMap.get(key);
    },

    set(key, value) {
      return storeMap.set(key, value);
    }
  };

  const _getExistingType = _schemaStore.get.bind(_schemaStore);

  const types = domainTypeNames.map(x => {
    const type = buildType(schema[x], {
      buildSubType: buildSubType(_schemaStore),

      getExistingType: _getExistingType,
      resolvers
    });

    _schemaStore.set(schema[x].name, type);

    return [x, type];
  }).reduce((a, [x, y]) => {
    a[x] = y;
    return a;
  }, {});

  return types;
}

module.exports = {
  buildTypes,

  buildSubType,
  buildType
};
