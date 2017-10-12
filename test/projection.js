'use strict';

const {
  deepStrictEqual
} = require('assert');

const {
  getProjection
} = require('..');

describe('getProjection', () => {
  describe('should return empty', () => {
    it('when fieldASTs is not set', () => {
      deepStrictEqual(getProjection(), {});
    });

    it('when fieldASTs.fieldNodes is not an array', () => {
      deepStrictEqual(getProjection({}), {});
    });

    it('when fieldASTs.fieldNodes is empty', () => {
      deepStrictEqual(getProjection({ fieldNodes: [] }), {});
    });

    it('when fieldASTs.fieldNodes[0].selectionSet is not set', () => {
      deepStrictEqual(getProjection({ fieldNodes: [{}] }), {});
    });

    it('when fieldASTs.fieldNodes[0].selectionSet.selections is not an array',
      () => {
        deepStrictEqual(getProjection({ fieldNodes: [{
          selectionSet: {}
        }] }), {});
      });
  });

  describe('should return', () => {
    it('an empty object', () => {
      deepStrictEqual(getProjection({ fieldNodes: [{
        selectionSet: {
          selections: []
        }
      }] }), {});
    });

    it('a projection object', () => {
      deepStrictEqual(getProjection({ fieldNodes: [{
        selectionSet: {
          selections: [{
            name: {
              value: 'a'
            }
          }, {
            name: {
              value: 'b'
            }
          }]
        }
      }] }), {
        a: 1,
        b: 1
      });
    });
  });
});
