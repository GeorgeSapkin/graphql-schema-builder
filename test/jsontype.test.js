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
} = require('../src/jsontype');

const GraphQLJSON  = _GraphQLJSON(graphql);
const parseLiteral = _parseLiteral(graphql);

describe('GraphQLJSON', () => {
  const obj = { a: 1 };
  it('serialize works', () => {
    expect(GraphQLJSON.serialize(obj)).toMatchObject(obj);
  });

  it('parseValue works', () => {
    expect(GraphQLJSON.parseValue(obj)).toMatchObject(obj);
  });
});

describe('parseLiteral', () => {
  describe('returns', () => {
    it('boolean value', () => {
      expect(parseLiteral({
        kind:  BOOLEAN,
        value: true
      })).toBeTruthy();
    });

    it('string value', () => {
      expect(parseLiteral({
        kind:  BOOLEAN,
        value: 'abc'
      })).toBe('abc');
    });

    it('float value when FLOAT', () => {
      expect(parseLiteral({
        kind:  FLOAT,
        value: '1.23'
      })).toBe(1.23);
    });

    it('float value when INT', () => {
      expect(parseLiteral({
        kind:  INT,
        value: '1'
      })).toBe(1);
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
      })).toMatchObject([1.23, 'abc']);
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
      })).toMatchObject({
        a: 'abc',
        b: {
          c: false
        }
      });
    });

    it('null', () => {
      expect(parseLiteral({
        kind:  123,
        value: 456
      })).toBeNull();
    });
  });
});
