'use strict';

const {
  memoize
} = require('./memoize');

const parseLiteral = graphql => function _parseLiteral(ast) {
  const {
    Kind: {
      BOOLEAN,
      FLOAT,
      INT,
      LIST,
      OBJECT,
      STRING
    }
  } = graphql;

  switch (ast.kind) {
    case BOOLEAN:
    case STRING:
      return ast.value;

    case FLOAT:
    case INT:
      return parseFloat(ast.value);

    case LIST:
      return ast.values.map(_parseLiteral);

    case OBJECT: {
      const value = {};
      ast.fields.map(field => {
        value[field.name.value] = _parseLiteral(field.value);
      });

      return value;
    }

    default:
      return null;
  }
};

function GraphQLJSON(graphql) {
  return new graphql.GraphQLScalarType({
    name:         'JSON',
    parseLiteral: parseLiteral(graphql),
    parseValue:   a => a,
    serialize:    a => a
  });
}

module.exports = {
  GraphQLJSON:  memoize(GraphQLJSON),
  parseLiteral: memoize(parseLiteral)
};
