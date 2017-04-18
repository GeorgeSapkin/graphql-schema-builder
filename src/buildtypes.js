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
        if (typeof ref === 'string') {
            const refType = schemaStore.get(ref);
            return required ? new GraphQLNonNull(refType) : refType;
        }
        else
            return required ? new GraphQLNonNull(GraphQLID) : GraphQLID;
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

function buildFields(schemaStore, fields, resolvers) {
    assert(schemaStore instanceof Map, 'schemaStore must be a Map');
    assert(fields != null, 'fields must be set');

    return Object.getOwnPropertyNames(fields).map(x => {
        const fieldData = fields[x];

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
    });
}

function buildType(schemaStore, typeSchema, resolvers = null) {
    assert(schemaStore instanceof Map, 'schemaStore must be a Map');
    assert(typeSchema, 'typeSchema must be set');
    assert(typeSchema.name, 'typeSchema.name must be set');

    // fields is a function to resolve reference types dynamically
    function fields() {
        const dbFields = (() => {
            if (typeSchema.dynamicFields == null)
                return typeSchema.fields(types);
            else
                return Object.assign(
                    typeSchema.fields(types),
                    typeSchema.dynamicFields(types)
                );
        })();

        const _resolvers = Array.isArray(resolvers)
            ? resolvers[typeSchema.name]
            : null;

        const _fields = buildFields(schemaStore, dbFields, _resolvers);

        _fields.push({
            id: {
                type: new GraphQLNonNull(GraphQLID)
            }
        });

        // TODO: simplify
        return _fields.reduce((a, b) => Object.assign(a, b), {});
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
        const type = buildType(schemaStore, schema[x], resolvers);

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
