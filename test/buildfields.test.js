'use strict';

const graphql = require('graphql');

const {
  GraphQLDateTime
} = require('graphql-iso-date');

const {
  buildFields
} = require('..')(graphql);

const {
  Asset,
  assetResolvers,
  assetResolversWithArgs,
  assetResolversWithArgsAsFunc,
  AssetWithMeasurements,
  Customer,
  CustomerNested,
  customerResolvers,
  Measurement,
  nop,
  schemaStore
} = require('./fixtures');

const {
  types: {
    ObjectId
  }
} = require('../src/types');

const {
  GraphQLFloat,
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLString
} = graphql;

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
      ).toMatchObject({
        name: {
          description: 'The name of the customer.',
          type:        new GraphQLNonNull(GraphQLString)
        },

        value: {
          type: new GraphQLNonNull(GraphQLFloat)
        },

        assets: {
          type: new GraphQLNonNull(new GraphQLList(
            new GraphQLNonNull(schemaStore.get(Asset.name))
          )),

          resolve: customerResolvers.assets
        }
      }
      );
    });

    it('from function fields', () => {
      expect(
        buildFields(Customer.dynamicFields, {
          getExistingType,

          resolvers: customerResolvers
        })
      ).toMatchObject({
        assets: {
          type: new GraphQLNonNull(new GraphQLList(
            new GraphQLNonNull(schemaStore.get(Asset.name))
          )),

          resolve: customerResolvers.assets
        }
      }
      );
    });

    it('from a field with an object resolver without args', () => {
      expect(
        buildFields(AssetWithMeasurements.fields, {
          getExistingType,

          resolvers: assetResolvers
        })
      ).toMatchObject({
        measurements: {
          type: new GraphQLNonNull(new GraphQLList(
            new GraphQLNonNull(schemaStore.get(Measurement.name))
          )),

          resolve: assetResolvers.measurements.resolve
        }
      }
      );
    });

    it('from a field with an object resolver with object args', () => {
      expect(
        buildFields(AssetWithMeasurements.fields, {
          getExistingType,

          resolvers: assetResolversWithArgs
        })
      ).toMatchObject({
        measurements: {
          type: new GraphQLNonNull(new GraphQLList(
            new GraphQLNonNull(schemaStore.get(Measurement.name))
          )),

          args: {
            resolution: {
              type: new GraphQLNonNull(GraphQLString)
            }
          },

          resolve: assetResolversWithArgs.measurements.resolve
        }
      }
      );
    });

    it('from a field with an object resolver with function args', () => {
      expect(
        buildFields(AssetWithMeasurements.fields, {
          getExistingType,

          resolvers: assetResolversWithArgsAsFunc
        })
      ).toMatchObject({
        measurements: {
          type: new GraphQLNonNull(new GraphQLList(
            new GraphQLNonNull(schemaStore.get(Measurement.name))
          )),

          args: {
            time: {
              type: GraphQLDateTime
            }
          },

          resolve: assetResolversWithArgsAsFunc.measurements.resolve
        }
      }
      );
    });

    it('from nested fields', () => {
      const fields = buildFields(CustomerNested.fields);
      expect(fields.metadata.type).toBeInstanceOf(GraphQLInputObjectType);
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
