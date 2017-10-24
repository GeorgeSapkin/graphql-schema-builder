'use strict';

const {
  deepStrictEqual,
  strictEqual
} = require('assert');

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

const {
  GraphQLJSON,

  parseLiteral
} = require('../src/jsontype');

describe('GraphQLJSON', () => {
  it('serialize works', () => {
    const obj = { a: 1 };
    strictEqual(GraphQLJSON.serialize(obj), obj);
  });

  it('parseValue works', () => {
    const obj = { a: 1 };
    strictEqual(GraphQLJSON.parseValue(obj), obj);
  });
});

describe('parseLiteral', () => {
  describe('returns', () => {
    it('boolean value', () => {
      strictEqual(parseLiteral({
        kind:  BOOLEAN,
        value: true
      }), true);
    });

    it('string value', () => {
      strictEqual(parseLiteral({
        kind:  BOOLEAN,
        value: 'abc'
      }), 'abc');
    });

    it('float value when FLOAT', () => {
      strictEqual(parseLiteral({
        kind:  FLOAT,
        value: '1.23'
      }), 1.23);
    });

    it('float value when INT', () => {
      strictEqual(parseLiteral({
        kind:  INT,
        value: '1'
      }), 1);
    });

    it('list value', () => {
      deepStrictEqual(parseLiteral({
        kind:  LIST,
        values: [{
          kind:  FLOAT,
          value: '1.23'
        }, {
          kind:  STRING,
          value: 'abc'
        }]
      }), [1.23, 'abc']);
    });

    it('object value', () => {
      deepStrictEqual(parseLiteral({
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
      }), {
        a: 'abc',
        b: {
          c: false
        }
      });
    });

    it('null', () => {
      strictEqual(parseLiteral({
        kind:  123,
        value: 456
      }), null);
    });
  });
});
