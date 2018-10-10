'use strict';

const graphql = require('graphql');

const {
  buildFields
} = require('..')(graphql);

const {
  assetResolvers,
  assetResolversWithArgs,
  assetResolversWithArgsAsFunc,
  AssetWithMeasurements,
  Customer,
  CustomerNested,
  customerResolvers,
  nop,
  schemaStore
} = require('./__fixtures__');

const {
  types: {
    ObjectId
  }
} = require('../types');

describe('buildFields', () => {
  describe('returns a field schema', () => {
    const getExistingType = schemaStore.get.bind(schemaStore);

    it('from object fields', () => {
      const allFields = {
        ...Customer.fields,
        ...Customer.dynamicFields({ ObjectId })
      };

      expect(
        buildFields(allFields, {
          getExistingType,

          resolvers: customerResolvers
        })
      ).toMatchSnapshot();
    });

    it('from function fields', () => {
      expect(
        buildFields(Customer.dynamicFields, {
          getExistingType,

          resolvers: customerResolvers
        })
      ).toMatchSnapshot();
    });

    it('from a field with an object resolver without args', () => {
      expect(
        buildFields(AssetWithMeasurements.fields, {
          getExistingType,

          resolvers: assetResolvers
        })
      ).toMatchSnapshot();
    });

    it('from a field with an object resolver with object args', () => {
      expect(
        buildFields(AssetWithMeasurements.fields, {
          getExistingType,

          resolvers: assetResolversWithArgs
        })
      ).toMatchSnapshot();
    });

    it('from a field with an object resolver with function args', () => {
      expect(
        buildFields(AssetWithMeasurements.fields, {
          getExistingType,

          resolvers: assetResolversWithArgsAsFunc
        })
      ).toMatchSnapshot();
    });

    it('from nested fields', () => {
      const fields = buildFields(CustomerNested.fields);
      expect(fields.metadata.type).toMatchSnapshot();
    });
  });

  describe('throws', () => {
    it('without fields', () => expect(buildFields).toThrow());

    it('without buildSubType', () => expect(() => buildFields({}, {
      buildSubType: null
    })).toThrow());
    it('without buildSubType', () => expect(() => buildFields({}, {
      buildSubType:    nop,
      getExistingType: null
    })).toThrow());
  });
});
