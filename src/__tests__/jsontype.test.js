'use strict';

const graphql = require('graphql');

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

const {
  GraphQLJSON: _GraphQLJSON,

  parseLiteral: _parseLiteral
} = require('../jsontype');

const GraphQLJSON  = _GraphQLJSON(graphql);
const parseLiteral = _parseLiteral(graphql);

describe('GraphQLJSON', () => {
  const obj = { a: 1 };
  it('serialize works', () => {
    expect(GraphQLJSON.serialize(obj)).toMatchSnapshot();
  });

  it('parseValue works', () => {
    expect(GraphQLJSON.parseValue(obj)).toMatchSnapshot();
  });
});

describe('parseLiteral', () => {
  describe('returns', () => {
    it('boolean value', () => {
      expect(parseLiteral({
        kind:  BOOLEAN,
        value: true
      })).toMatchSnapshot();
    });

    it('string value', () => {
      expect(parseLiteral({
        kind:  BOOLEAN,
        value: 'abc'
      })).toMatchSnapshot();
    });

    it('float value when FLOAT', () => {
      expect(parseLiteral({
        kind:  FLOAT,
        value: '1.23'
      })).toMatchSnapshot();
    });

    it('float value when INT', () => {
      expect(parseLiteral({
        kind:  INT,
        value: '1'
      })).toMatchSnapshot();
    });

    it('list value', () => {
      expect(parseLiteral({
        kind:  LIST,
        values: [{
          kind:  FLOAT,
          value: '1.23'
        }, {
          kind:  STRING,
          value: 'abc'
        }]
      })).toMatchSnapshot();
    });

    it('object value', () => {
      expect(parseLiteral({
        kind:   OBJECT,
        fields: [{
          name: {
            value: 'a'
          },
          value: {
            kind:  STRING,
            value: 'abc'
          }
        }, {
          name: {
            value: 'b'
          },
          value: {
            kind:   OBJECT,
            fields: [{
              name: {
                value: 'c'
              },
              value: {
                kind:  BOOLEAN,
                value: false
              }
            }]
          }
        }]
      })).toMatchSnapshot();
    });

    it('null', () => {
      expect(parseLiteral({
        kind:  123,
        value: 456
      })).toMatchSnapshot();
    });
  });
});
