'use strict';

const {
  GraphQLBoolean,
  GraphQLFloat,
  GraphQLID,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} = require('graphql');

const {
  GraphQLDateTime
} = require('graphql-iso-date');

const {
  types: {
    Mixed,
    ObjectId
  }
} = require('../src/types');

const {
  getQLType
} = require('../src/getqltype');

const {
  GraphQLJSON
} = require('../src/jsontype');

const {
  Asset,
  nop,
  schemaStore
} = require('./fixtures');

describe('getQLType', () => {
  describe('returns', () => {
    it('String!', () => {
      expect(
        getQLType(nop, { type: String })
      ).toMatchObject(
        new GraphQLNonNull(GraphQLString)
      );
    });

    it('String', () => {
      expect(
        getQLType(nop, { type: String, required: false })
      ).toMatchObject(
        GraphQLString
      );
    });

    it('Float!', () => {
      expect(
        getQLType(nop, { type: Number })
      ).toMatchObject(
        new GraphQLNonNull(GraphQLFloat)
      );
    });

    it('Float', () => {
      expect(
        getQLType(nop, { type: Number, required: false })
      ).toMatchObject(
        GraphQLFloat
      );
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
      ).toMatchObject(
        GraphQLDateTime
      );
    });

    it('Boolean!', () => {
      expect(
        getQLType(nop, { type: Boolean })
      ).toMatchObject(
        new GraphQLNonNull(GraphQLBoolean)
      );
    });

    it('Boolean', () => {
      expect(
        getQLType(nop, { type: Boolean, required: false })
      ).toMatchObject(
        GraphQLBoolean
      );
    });

    it('JSON!', () => {
      expect(
        getQLType(nop, { type: Mixed })
      ).toMatchObject(
        new GraphQLNonNull(GraphQLJSON)
      );
    });

    it('JSON', () => {
      expect(
        getQLType(nop, { type: Mixed, required: false })
      ).toMatchObject(
        GraphQLJSON
      );
    });

    it('ID!', () => {
      expect(
        getQLType(nop, { type: ObjectId })
      ).toMatchObject(
        new GraphQLNonNull(GraphQLID)
      );
    });

    it('ID', () => {
      expect(
        getQLType(nop, { type: ObjectId, required: false })
      ).toMatchObject(
        GraphQLID
      );
    });

    it('refType!', () => {
      const getExistingType = () => new GraphQLObjectType(Asset);

      expect(
        getQLType(getExistingType, {
          type: ObjectId,
          ref:  Asset.name
        })
      ).toMatchObject(
        new GraphQLNonNull(schemaStore.get(Asset.name))
      );
    });

    it('refType', () => {
      const getExistingType = schemaStore.get.bind(schemaStore);

      expect(
        getQLType(getExistingType, {
          type: ObjectId, ref: Asset.name, required: false
        })
      ).toMatchObject(
        schemaStore.get(Asset.name)
      );
    });

    it('string', () => {
      const getExistingType = schemaStore.get.bind(schemaStore);

      expect(
        getQLType(getExistingType, {
          type: 'Asset', required: false
        })
      ).toMatchObject(
        schemaStore.get(Asset.name)
      );
    });

    it('string!', () => {
      const getExistingType = schemaStore.get.bind(schemaStore);

      expect(
        getQLType(getExistingType, {
          type: 'Asset'
        })
      ).toMatchObject(
        new GraphQLNonNull(schemaStore.get(Asset.name))
      );
    });

    it('ID!', () => {
      expect(
        getQLType(nop, { type: ObjectId })
      ).toMatchObject(
        new GraphQLNonNull(GraphQLID)
      );
    });

    it('[String]!', () => {
      expect(
        getQLType(nop, {
          type:     [{ type: String }],
          required: false
        })
      ).toMatchObject(
        new GraphQLList(
          new GraphQLNonNull(
            GraphQLString
          )
        )
      );
    });

    it('[Float!]', () => {
      expect(
        getQLType(nop, { type: [Number], required: false })
      ).toMatchObject(
        new GraphQLList(new GraphQLNonNull(GraphQLFloat))
      );
    });

    it('[Boolean]!', () => {
      expect(
        getQLType(nop, { type: [{ type: Boolean, required: false }] })
      ).toMatchObject(
        new GraphQLNonNull(new GraphQLList(GraphQLBoolean))
      );
    });

    it('[refType!]!', () => {
      const getExistingType = schemaStore.get.bind(schemaStore);

      expect(
        getQLType(getExistingType, {
          type: [ObjectId],
          ref:  Asset.name
        })
      ).toMatchObject(
        new GraphQLNonNull(
          new GraphQLList(
            new GraphQLNonNull(schemaStore.get(Asset.name))
          )
        )
      );
    });

    it('[string!]!', () => {
      const getExistingType = schemaStore.get.bind(schemaStore);

      expect(
        getQLType(getExistingType, {
          type: ['Asset']
        })
      ).toMatchObject(
        new GraphQLNonNull(
          new GraphQLList(
            new GraphQLNonNull(schemaStore.get(Asset.name))
          )
        )
      );
    });

    it('null', () => expect(getQLType(nop, { type: {} })).toBeNull());
  });

  describe('throws', () => {
    it('without schemaStore', () => expect(getQLType).toThrow());

    it('with bad schemaStore', () => expect(() => getQLType({})).toThrow());

    it('without type', () => expect(() => getQLType(new Map())).toThrow());
  });
});
