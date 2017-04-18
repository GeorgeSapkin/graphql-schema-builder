'use strict';

const {
    GraphQLScalarType
} = require('graphql');

const {
    Kind: {
        BOOLEAN,
        FLOAT,
        INT,
        LIST,
        OBJECT,
        STRING
    }
} = require('graphql/language');

function parseLiteral(ast) {
    switch (ast.kind) {
    case BOOLEAN:
    case STRING:
        return ast.value;

    case FLOAT:
    case INT:
        return parseFloat(ast.value);

    case LIST:
        return ast.values.map(parseLiteral);

    case OBJECT: {
        const value = {};
        ast.fields.map(field => {
            value[field.name.value] = parseLiteral(field.value);
        });

        return value;
    }

    default:
        return null;
    }
}

const GraphQLJSON = new GraphQLScalarType({
    name:       'JSON',
    serialize:  a => a,
    parseValue: a => a,

    parseLiteral
});

module.exports = {
    GraphQLJSON,

    parseLiteral
};
