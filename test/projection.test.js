'use strict';

const graphql = require('graphql');

const {
  getProjection
} = require('..')(graphql);

describe('getProjection', () => {
  describe('returns empty', () => {
    it('when fieldASTs is not set', () => {
      expect(getProjection()).toMatchObject({});
    });

    it('when fieldASTs.fieldNodes is not an array', () => {
      expect(getProjection({})).toMatchObject({});
    });

    it('when fieldASTs.fieldNodes is empty', () => {
      expect(getProjection({ fieldNodes: [] })).toMatchObject({});
    });

    it('when fieldASTs.fieldNodes[0].selectionSet is not set', () => {
      expect(getProjection({ fieldNodes: [{}] })).toMatchObject({});
    });

    it('when fieldASTs.fieldNodes[0].selectionSet.selections is not an array',
      () => {
        expect(getProjection({ fieldNodes: [{
          selectionSet: {}
        }] })).toMatchObject({});
      });
  });

  describe('returns', () => {
    it('an empty object', () => {
      expect(getProjection({ fieldNodes: [{
        selectionSet: {
          selections: []
        }
      }] })).toMatchObject({});
    });

    it('a projection object', () => {
      expect(getProjection({ fieldNodes: [{
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
      }] })).toMatchObject({
        a: 1,
        b: 1
      });
    });
  });
});
