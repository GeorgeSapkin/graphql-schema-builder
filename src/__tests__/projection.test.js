'use strict';

const graphql = require('graphql');

const {
  getProjection
} = require('..')(graphql);

describe('getProjection', () => {
  describe('returns empty', () => {
    it('when fieldASTs is not set', () => {
      expect(getProjection()).toMatchSnapshot();
    });

    it('when fieldASTs.fieldNodes is not an array', () => {
      expect(getProjection({})).toMatchSnapshot();
    });

    it('when fieldASTs.fieldNodes is empty', () => {
      expect(getProjection({ fieldNodes: [] })).toMatchSnapshot();
    });

    it('when fieldASTs.fieldNodes[0].selectionSet is not set', () => {
      expect(getProjection({ fieldNodes: [{}] })).toMatchSnapshot();
    });

    it('when fieldASTs.fieldNodes[0].selectionSet.selections is not an array',
      () => {
        expect(getProjection({ fieldNodes: [{
          selectionSet: {}
        }] })).toMatchSnapshot();
      });
  });

  describe('returns', () => {
    it('an empty object', () => {
      expect(getProjection({ fieldNodes: [{
        selectionSet: {
          selections: []
        }
      }] })).toMatchSnapshot();
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
      }] })).toMatchSnapshot();
    });
  });
});
