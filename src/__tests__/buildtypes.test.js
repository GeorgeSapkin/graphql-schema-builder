'use strict';

const graphql = require('graphql');

const {
  buildSubType: _buildSubType,
  buildType:    _buildType
} = require('../buildtypes');

const {
  types: {
    Mixed,
    ObjectId
  }
} = require('../types');

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
  resolvers,
  schemaStore
} = require('./__fixtures__');

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

      expect(customerType._fields).toBeInstanceOf(Function);

      expect(
        customerType._fields().assets.resolve
      ).toBe(
        customerResolvers.assets
      );
    });

    it('a type schema (fun/no-dyn)', () => {
      const customerType = buildType(CustomerFunNoDyn);

      expect(customerType.name).toBe(Customer.name);

      expect(customerType._fields).toBeInstanceOf(Function);

      expect(
        customerType._fields().name.type
      ).toMatchObject(
        new GraphQLNonNull(GraphQLJSON)
      );
      expect(customerType._fields().assets).toBeUndefined();
    });

    it('a type schema (obj/no-dyn)', () => {
      const customerType = buildType(CustomerObjNoDyn);

      expect(customerType.name).toBe(Customer.name);

      expect(customerType._fields).toBeInstanceOf(Function);

      expect(
        customerType._fields().name.type
      ).toMatchObject(
        new GraphQLNonNull(GraphQLString)
      );
      expect(customerType._fields().assets).toBeUndefined();
    });

    it('a type schema (fun/obj)', () => {
      const customerType = buildType(CustomerFunObj);

      expect(customerType.name).toBe(Customer.name);

      expect(customerType._fields).toBeInstanceOf(Function);

      expect(
        customerType._fields().name.type
      ).toMatchObject(
        new GraphQLNonNull(GraphQLJSON)
      );
      expect(customerType._fields().assets.resolve).toBeUndefined();
    });

    it('a type schema (obj/fun)', () => {
      const customerType = buildType(CustomerObjFun);

      expect(customerType.name).toBe(Customer.name);

      expect(customerType._fields).toBeInstanceOf(Function);

      expect(
        customerType._fields().name.type
      ).toMatchObject(
        new GraphQLNonNull(GraphQLString)
      );
      expect(customerType._fields().assets.resolve).toBeUndefined();
    });

    it('a nested type schema', () => {
      const customerType = buildType(CustomerNested, {});

      expect(customerType.name).toBe(Customer.name);

      expect(customerType._fields).toBeInstanceOf(Function);

      expect(
        customerType._fields().metadata.type
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

      expect(assetType).toMatchSnapshot();
      expect(customerType).toMatchSnapshot();

      expect(assetType._fields).toBeInstanceOf(Function);
      expect(customerType._fields).toBeInstanceOf(Function);

      expect(assetType._fields().metadata).toMatchSnapshot();

      expect(
        assetType._fields().metadata
      ).toMatchObject(
        customerType._fields().metadata
      );
    });

    it('a nested subtype provided via the type property', () => {
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
      expect(assetType._fields).toBeInstanceOf(Function);

      expect(
        assetType._fields().metadata.type
      ).toBeInstanceOf(
        GraphQLObjectType
      );
    });

    it('a nested array of subtype', () => {
      const localSchemaStore = new Map();

      function buildSubType(type) {
        const newType = new GraphQLObjectType(type);
        localSchemaStore.set(type.name, newType);
        return newType;
      }

      const getExistingType = localSchemaStore.get.bind(localSchemaStore);

      const assetArray = buildType(AssetNestedArray, {
        buildSubType,
        getExistingType
      });

      expect(assetArray.name).toBe(AssetNestedType.name);
      expect(assetArray._fields).toBeInstanceOf(Function);

      expect(
        assetArray._fields().metadatas.type
      ).toBeInstanceOf(
        GraphQLList
      );
    });

    it('a nested array of subtype provided via the type property', () => {
      const localSchemaStore = new Map();

      function buildSubType(type) {
        const newType = new GraphQLObjectType(type);
        localSchemaStore.set(type.name, newType);
        return newType;
      }

      const getExistingType = localSchemaStore.get.bind(localSchemaStore);

      const assetArrayType = buildType(AssetNestedArrayType, {
        buildSubType,
        getExistingType
      });

      expect(assetArrayType.name).toBe(AssetNestedType.name);
      expect(assetArrayType._fields).toBeInstanceOf(Function);

      expect(
        assetArrayType._fields().metadatas.type
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
      })._fields();

      expect(() => buildType(BadAssetNested, {
        buildSubType,
        getExistingType
      })._fields()).toThrow();
    });

    it('with different sub type and _fields as object', () => {
      const localSchemaStore = new Map();

      function buildSubType(type) {
        const newType = new GraphQLObjectType(type);
        localSchemaStore.set(type.name, newType);
        return newType;
      }

      const getExistingType = name => {
        const existingType = localSchemaStore.get(name);
        if (existingType != null)
          existingType._fields = existingType._fields();
        return existingType;
      };

      buildType(CustomerNested, {
        buildSubType,
        getExistingType
      })._fields();

      expect(() => buildType(BadAssetNested, {
        buildSubType,
        getExistingType
      })._fields()).toThrow();
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
      expect(customerType._fields).toBeInstanceOf(Function);

      expect(
        customerType._fields().assets.resolve
      ).toBe(
        customerResolvers.assets
      );
    });

    it('type schemas with getExistingType returning nothing', () => {
      const getExistingType = jest.fn(() => null);

      const { Customer: customerType } = buildTypes({
        Asset,
        Customer
      }, resolvers, getExistingType);

      expect(customerType.name).toBe(Customer.name);
      expect(customerType.description).toBe(Customer.description);
      expect(customerType._fields).toBeInstanceOf(Function);

      expect(
        customerType._fields().assets.resolve
      ).toBe(
        customerResolvers.assets
      );

      expect(getExistingType.mock.calls.length).toBe(1);
    });
  });

  describe('throws', () => {
    it('without schema', () => expect(buildTypes).toThrow());
  });
});

describe('types', () => {
  it('Mixed should work', () => expect(Mixed.inspect()).toMatchSnapshot());

  it('ObjectId should work', () => expect(
    ObjectId.inspect()).toMatchSnapshot()
  );
});
