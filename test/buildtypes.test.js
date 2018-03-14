'use strict';

const graphql = require('graphql');

const {
  spy
} = require('sinon');

const {
  buildSubType: _buildSubType,
  buildType:    _buildType
} = require('../src/buildtypes');

const {
  types: {
    Mixed,
    ObjectId
  }
} = require('../src/types');

const {
  buildTypes,
  GraphQLJSON
} = require('..')(graphql);

const {
  Asset,
  AssetNested,
  AssetNestedType,
  AssetNestedArray,
  AssetNestedArrayType,
  BadAssetNested,
  Customer,
  CustomerFunNoDyn,
  CustomerFunObj,
  CustomerNested,
  CustomerObjFun,
  CustomerObjNoDyn,
  customerResolvers,
  nop,
  resolvers
} = require('./fixtures');

const {
  GraphQLInputObjectType,
  GraphQLList,
  GraphQLNonNull,
  GraphQLObjectType,
  GraphQLString
} = graphql;

const buildSubType = _buildSubType(graphql);
const buildType    = _buildType(graphql);

describe('buildType', () => {
  describe('returns', () => {
    it('a type schema with resolvers', () => {
      const customerType = buildType(Customer, {
        resolvers
      });

      expect(customerType.name).toBe(Customer.name);
      expect(customerType.description).toBe(Customer.description);

      expect(customerType._typeConfig.fields).toBeInstanceOf(Function);

      expect(
        customerType._typeConfig.fields().assets.resolve
      ).toBe(
        customerResolvers.assets
      );
    });

    it('a type schema (fun/no-dyn)', () => {
      const customerType = buildType(CustomerFunNoDyn);

      expect(customerType.name).toBe(Customer.name);

      expect(customerType._typeConfig.fields).toBeInstanceOf(Function);

      expect(
        customerType._typeConfig.fields().name.type
      ).toMatchObject(
        new GraphQLNonNull(GraphQLJSON)
      );
      expect(customerType._typeConfig.fields().assets).toBeUndefined();
    });

    it('a type schema (obj/no-dyn)', () => {
      const customerType = buildType(CustomerObjNoDyn);

      expect(customerType.name).toBe(Customer.name);

      expect(customerType._typeConfig.fields).toBeInstanceOf(Function);

      expect(
        customerType._typeConfig.fields().name.type
      ).toMatchObject(
        new GraphQLNonNull(GraphQLString)
      );
      expect(customerType._typeConfig.fields().assets).toBeUndefined();
    });

    it('a type schema (fun/obj)', () => {
      const customerType = buildType(CustomerFunObj);

      expect(customerType.name).toBe(Customer.name);

      expect(customerType._typeConfig.fields).toBeInstanceOf(Function);

      expect(
        customerType._typeConfig.fields().name.type
      ).toMatchObject(
        new GraphQLNonNull(GraphQLJSON)
      );
      expect(customerType._typeConfig.fields().assets.resolve).toBeUndefined();
    });

    it('a type schema (obj/fun)', () => {
      const customerType = buildType(CustomerObjFun);

      expect(customerType.name).toBe(Customer.name);

      expect(customerType._typeConfig.fields).toBeInstanceOf(Function);

      expect(
        customerType._typeConfig.fields().name.type
      ).toMatchObject(
        new GraphQLNonNull(GraphQLString)
      );
      expect(customerType._typeConfig.fields().assets.resolve).toBeUndefined();
    });

    it('a nested type schema', () => {
      const customerType = buildType(CustomerNested, {});

      expect(customerType.name).toBe(Customer.name);

      expect(customerType._typeConfig.fields).toBeInstanceOf(Function);

      expect(
        customerType._typeConfig.fields().metadata.type
      ).toBeInstanceOf(
        GraphQLInputObjectType
      );
    });

    it('a nested type schema with duplicate sub type', () => {
      const localSchemaStore = new Map();

      function buildSubType(type) {
        const newType = new GraphQLObjectType(type);
        localSchemaStore.set(type.name, newType);
        return newType;
      }

      const getExistingType = localSchemaStore.get.bind(localSchemaStore);

      const assetType = buildType(AssetNested, {
        buildSubType,
        getExistingType
      });
      const customerType = buildType(CustomerNested, {
        buildSubType,
        getExistingType
      });

      expect(assetType.name).toBe(Asset.name);
      expect(customerType.name).toBe(Customer.name);

      expect(assetType._typeConfig.fields).toBeInstanceOf(Function);
      expect(customerType._typeConfig.fields).toBeInstanceOf(Function);

      expect(
        assetType._typeConfig.fields().metadata.type
      ).toBeInstanceOf(
        GraphQLObjectType
      );

      expect(
        assetType._typeConfig.fields().metadata
      ).toMatchObject(
        customerType._typeConfig.fields().metadata
      );
    });

    it('a nested type schema provided via the type property', () => {
      const localSchemaStore = new Map();

      function buildSubType(type) {
        const newType = new GraphQLObjectType(type);
        localSchemaStore.set(type.name, newType);
        return newType;
      }

      const getExistingType = localSchemaStore.get.bind(localSchemaStore);

      // nested type
      const assetType = buildType(AssetNestedType, {
        buildSubType,
        getExistingType
      });

      expect(assetType.name).toBe(AssetNestedType.name);
      expect(assetType._typeConfig.fields).toBeInstanceOf(Function);

      expect(
        assetType._typeConfig.fields().metadata.type
      ).toBeInstanceOf(
        GraphQLObjectType
      );

      // nested list of object types
      const assetArrayType = buildType(AssetNestedArrayType, {
        buildSubType,
        getExistingType
      });

      expect(assetArrayType.name).toBe(AssetNestedType.name);
      expect(assetArrayType._typeConfig.fields).toBeInstanceOf(Function);

      expect(
        assetArrayType._typeConfig.fields().metadatas.type
      ).toBeInstanceOf(
        GraphQLList
      );

      const assetArray = buildType(AssetNestedArray, {
        buildSubType,
        getExistingType
      });

      expect(assetArray.name).toBe(AssetNestedType.name);
      expect(assetArray._typeConfig.fields).toBeInstanceOf(Function);

      expect(
        assetArray._typeConfig.fields().metadatas.type
      ).toBeInstanceOf(
        GraphQLList
      );
    });
  });

  describe('throws', () => {
    it('without typeSchema', () => expect(buildType).toThrow());

    it('with bad typeSchema', () => expect(() => buildType({})).toThrow());

    it('without buildSubType', () => expect(() => buildType({}, {
      buildSubType: null
    })).toThrow());

    it('without getExistingType', () => expect(() => buildType({}, {
      buildSubType:    nop,
      getExistingType: null
    })).toThrow());

    it('with different sub type', () => {
      const localSchemaStore = new Map();

      function buildSubType(type) {
        const newType = new GraphQLObjectType(type);
        localSchemaStore.set(type.name, newType);
        return newType;
      }

      const getExistingType = localSchemaStore.get.bind(localSchemaStore);

      buildType(CustomerNested, {
        buildSubType,
        getExistingType
      })._typeConfig.fields();

      expect(() => buildType(BadAssetNested, {
        buildSubType,
        getExistingType
      })._typeConfig.fields()).toThrow();
    });
  });
});

describe('buildSubType', () => {
  it('returns type', () => {
    const localSchemaStore = new Map();
    const __buildSubType   = buildSubType(localSchemaStore);

    __buildSubType(Customer);

    expect(
      localSchemaStore.get(Customer.name)
    ).toBeInstanceOf(
      GraphQLObjectType
    );
  });

  it('throws without schemaStore', () => expect(buildSubType).toThrow());
});

describe('buildTypes', () => {
  describe('returns', () => {
    it('type schemas', () => {
      const { Customer: customerType } = buildTypes({
        Asset,
        Customer
      }, resolvers);

      expect(customerType.name).toBe(Customer.name);
      expect(customerType.description).toBe(Customer.description);
      expect(customerType._typeConfig.fields).toBeInstanceOf(Function);

      expect(
        customerType._typeConfig.fields().assets.resolve
      ).toBe(
        customerResolvers.assets
      );
    });

    it('type schemas with getExistingType', () => {
      const getExistingType = spy();

      const { Customer: customerType } = buildTypes({
        Asset,
        Customer
      }, resolvers, getExistingType);

      expect(getExistingType.called);

      expect(customerType.name).toBe(Customer.name);
      expect(customerType.description).toBe(Customer.description);
      expect(customerType._typeConfig.fields).toBeInstanceOf(Function);

      expect(
        customerType._typeConfig.fields().assets.resolve
      ).toBe(
        customerResolvers.assets
      );
    });
  });

  describe('throws', () => {
    it('without schema', () => expect(buildTypes).toThrow());
  });
});

describe('types', () => {
  it('Mixed should work', () => expect(Mixed.inspect()).toBe('Mixed'));

  it('ObjectId should work', () => expect(ObjectId.inspect()).toBe('ObjectId'));
});
