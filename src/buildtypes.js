'use strict';

const assert = require('assert');

const {
    GraphQLBoolean,
    GraphQLFloat,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString
} = require('graphql');

const {
    GraphQLJSON
} = require('./jsontype');

const types = {
    Mixed:    { inspect: () => 'Mixed'    },
    ObjectId: { inspect: () => 'ObjectId' }
};

function getQLType(schemaStore, { type, ref, required = true }) {
    assert(schemaStore instanceof Map, 'schemaStore must be a Map');
    assert(type != null, 'type must be set');

    if (type === String) {
        return required ? new GraphQLNonNull(GraphQLString) : GraphQLString;
    }
    else if (type === Number) {
        return required ? new GraphQLNonNull(GraphQLFloat) : GraphQLFloat;
    }
    else if (type === Date) {
        return required ? new GraphQLNonNull(GraphQLInt) : GraphQLInt;
    }
    else if (type === Boolean) {
        return required ? new GraphQLNonNull(GraphQLBoolean) : GraphQLBoolean;
    }
    else if (type === types.Mixed) {
        return required ? new GraphQLNonNull(GraphQLJSON) : GraphQLJSON;
    }
    else if (type === types.ObjectId) {
        const refType = schemaStore.get(ref) || GraphQLID;
        return required ? new GraphQLNonNull(refType) : refType;
    }
    else if (Array.isArray(type)) {
        const subType = type[0];

        if (subType.type != null) {
            const listType = new GraphQLList(getQLType(schemaStore, subType));
            return required ? new GraphQLNonNull(listType) : listType;
        }
        else {
            const listType = new GraphQLList(getQLType(schemaStore, {
                type: subType,
                ref
            }));
            return required ? new GraphQLNonNull(listType) : listType;
        }
    }
    else
        return null;
}

function buildFields(fields, schemaStore = new Map, resolvers = null) {
    assert(fields != null, 'fields must be set');
    assert(schemaStore instanceof Map, 'schemaStore must be a Map');

    const _fields = (fields instanceof Function) ? fields(types) : fields;

    return Object.getOwnPropertyNames(_fields).map(x => {
        const fieldData = _fields[x];

        const type = (() => {
            if (fieldData.type != null)
                // figure out type based on type field
                return getQLType(schemaStore, fieldData);
            else
                // figure out type based fieldData
                return getQLType(schemaStore, { type: fieldData });
        })();

        const details = { type };
        if (fieldData.description)
            details.description = fieldData.description;

        if (resolvers != null && resolvers[x] != null) {
            details.resolve = resolvers[x];
        }

        return { [x]: details };
    }).reduce((a, b) => Object.assign(a, b), {});
}

function buildType(typeSchema, schemaStore = new Map, resolvers = null) {
    assert(typeSchema, 'typeSchema must be set');
    assert(schemaStore instanceof Map, 'schemaStore must be a Map');
    assert(typeSchema.name, 'typeSchema.name must be set');

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

        const _fields = buildFields(dbFields, schemaStore, _resolvers);
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

function buildTypes(schema, resolvers = null) {
    assert(schema != null, 'schema must be set');

    const domainTypeNames = Object.getOwnPropertyNames(schema);

    const schemaStore = new Map;

    const types = domainTypeNames.map(x => {
        const type = buildType(schema[x], schemaStore, resolvers);

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
    buildType,
    getQLType,
    types
};
