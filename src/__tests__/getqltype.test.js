'use strict';

const graphql = require('graphql');

const {
  GraphQLDateTime
} = require('graphql-iso-date');

const {
  types: {
    Mixed,
    ObjectId
  }
} = require('../types');

const {
  getQLType: _getQLType
} = require('../getqltype');

const {
  Asset,
  nop,
  schemaStore
} = require('./__fixtures__');

const {
  GraphQLNonNull,
  GraphQLObjectType
} = graphql;

const getQLType = _getQLType(graphql);

describe('getQLType', () => {
  describe('returns', () => {
    it('String!', () => {
      expect(
        getQLType(nop, { type: String })
      ).toMatchSnapshot();
    });

    it('String', () => {
      expect(
        getQLType(nop, { type: String, required: false })
      ).toMatchSnapshot();
    });

    it('Float!', () => {
      expect(
        getQLType(nop, { type: Number })
      ).toMatchSnapshot();
    });

    it('Float', () => {
      expect(
        getQLType(nop, { type: Number, required: false })
      ).toMatchSnapshot();
    });

    it('DateTime!', () => {
      expect(
        getQLType(nop, { type: Date })
      ).toMatchObject(
        new GraphQLNonNull(GraphQLDateTime)
      );
    });

    it('DateTime', () => {
      expect(
        getQLType(nop, { type: Date, required: false })
      ).toMatchSnapshot();
    });

    it('Boolean!', () => {
      expect(
        getQLType(nop, { type: Boolean })
      ).toMatchSnapshot();
    });

    it('Boolean', () => {
      expect(
        getQLType(nop, { type: Boolean, required: false })
      ).toMatchSnapshot();
    });

    it('JSON!', () => {
      expect(
        getQLType(nop, { type: Mixed })
      ).toMatchSnapshot();
    });

    it('JSON', () => {
      expect(
        getQLType(nop, { type: Mixed, required: false })
      ).toMatchSnapshot();
    });

    it('ID!', () => {
      expect(
        getQLType(nop, { type: ObjectId })
      ).toMatchSnapshot();
    });

    it('ID', () => {
      expect(
        getQLType(nop, { type: ObjectId, required: false })
      ).toMatchSnapshot();
    });

    it('refType!', () => {
      const getExistingType = () => new GraphQLObjectType(Asset);

      expect(
        getQLType(getExistingType, {
          type: ObjectId,
          ref:  Asset.name
        })
      ).toMatchSnapshot();
    });

    it('refType', () => {
      const getExistingType = schemaStore.get.bind(schemaStore);

      expect(
        getQLType(getExistingType, {
          type: ObjectId, ref: Asset.name, required: false
        })
      ).toMatchSnapshot();
    });

    it('stringType', () => {
      const getExistingType = schemaStore.get.bind(schemaStore);

      expect(
        getQLType(getExistingType, {
          type: 'Asset', required: false
        })
      ).toMatchSnapshot();
    });

    it('stringType!', () => {
      const getExistingType = schemaStore.get.bind(schemaStore);

      expect(
        getQLType(getExistingType, {
          type: 'Asset'
        })
      ).toMatchSnapshot();
    });

    it('ID!', () => {
      expect(
        getQLType(nop, { type: ObjectId })
      ).toMatchSnapshot();
    });

    it('[String]!', () => {
      expect(
        getQLType(nop, {
          type:     [{ type: String }],
          required: false
        })
      ).toMatchSnapshot();
    });

    it('[Float!]', () => {
      expect(
        getQLType(nop, { type: [Number], required: false })
      ).toMatchSnapshot();
    });

    it('[Boolean]!', () => {
      expect(
        getQLType(nop, { type: [{ type: Boolean, required: false }] })
      ).toMatchSnapshot();
    });

    it('[refType!]!', () => {
      const getExistingType = schemaStore.get.bind(schemaStore);

      expect(
        getQLType(getExistingType, {
          type: [ObjectId],
          ref:  Asset.name
        })
      ).toMatchSnapshot();
    });

    it('[stringType!]!', () => {
      const getExistingType = schemaStore.get.bind(schemaStore);

      expect(
        getQLType(getExistingType, {
          type: ['Asset']
        })
      ).toMatchSnapshot();
    });

    it('null', () => expect(getQLType(nop, { type: {} })).toMatchSnapshot());
  });

  describe('throws', () => {
    it('without schemaStore', () => expect(getQLType).toThrow());

    it('with bad schemaStore', () => expect(() => getQLType({})).toThrow());

    it('without type', () => expect(() => getQLType(new Map())).toThrow());
  });
});
