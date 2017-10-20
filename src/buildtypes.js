'use strict';

const {
  ok: assert,
  deepStrictEqual
} = require('assert');

const {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} = require('graphql');

const {
  GraphQLDateTime
} = require('graphql-iso-date');

const {
  GraphQLJSON
} = require('./jsontype');

const types = {
  Mixed:    { inspect: () => 'Mixed' },
  ObjectId: { inspect: () => 'ObjectId' }
};

function getQLType(getExistingType, { type, ref, required = true }) {
  assert(getExistingType instanceof Function,
    'getExistingType must be a function');
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
  else if (type === types.Mixed) {
    return required ? new GraphQLNonNull(GraphQLJSON) : GraphQLJSON;
  }
  else if (type === types.ObjectId) {
    const refType = getExistingType(ref) || GraphQLID;
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

function buildFields(fields, {
  buildSubType    = x => new GraphQLInputObjectType(x),
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
      // if fieldData is an object, not an array and doesn't have type
      // then assume it's a subtype

      if (fieldData instanceof Object &&
        !Array.isArray(fieldData) &&
        fieldData !== Number &&
        fieldData !== String &&
        fieldData !== types.Mixed &&
        fieldData !== types.ObjectId &&
        fieldData.type == null
      ) {
        const existingType = getExistingType(x);
        const fields = buildFields(fieldData, {
          buildSubType,
          getExistingType,
          resolvers
        });

        if (existingType != null) {
          const existingFields = existingType._typeConfig.fields;

          deepStrictEqual(fields, existingFields,
            `Subtypes' fields with same name ${x} have to match`
          );

          return existingType;
        }
        else
          return buildSubType({ name: x, fields });
      }
      else if (fieldData.type != null)
      // figure out type based on type field
        return getQLType(getExistingType, fieldData);
      else
      // figure out type based fieldData
        return getQLType(getExistingType, { type: fieldData });
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
          details.args = buildFields(resolver.args, {
            buildSubType,
            getExistingType
          });
      }
    }

    return { [x]: details };
  }).reduce((a, b) => Object.assign(a, b), {});
}

function buildType(typeSchema, {
  buildSubType    = x => new GraphQLInputObjectType(x),
  getExistingType = () => {},
  resolvers       = null
} = {}) {
  assert(typeSchema, 'typeSchema must be set');
  // assert(schemaStore instanceof Map, 'schemaStore must be a Map');
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

function buildTypes(schema, resolvers = null) {
  assert(schema != null, 'schema must be set');

  const domainTypeNames = Object.getOwnPropertyNames(schema);

  const schemaStore = new Map();

  const getExistingType = schemaStore.get.bind(schemaStore);

  const types = domainTypeNames.map(x => {
    const type = buildType(schema[x], {
      buildSubType: buildSubType(schemaStore),

      getExistingType,
      resolvers
    });

    schemaStore.set(schema[x].name, type);

    return [x, type];
  }).reduce((a, [x, y]) => {
    a[x] = y;
    return a;
  }, {});

  return types;
}

module.exports = {
  buildTypes,

  buildFields,
  buildSubType,
  buildType,
  getQLType,
  types
};
