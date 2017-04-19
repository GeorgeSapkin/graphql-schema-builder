'use strict';

const {
    ok: assert,
    deepStrictEqual,
    equal,
    strictEqual,
    throws
} = require('assert');

const {
    GraphQLBoolean,
    GraphQLFloat,
    GraphQLID,
    GraphQLInt,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString
} = require('graphql');

const {
    buildFields,
    buildType,
    buildTypes,
    getQLType,
    types: {
        Mixed,
        ObjectId
    }
} = require('../src/buildtypes');

const {
    GraphQLJSON
} = require('../src/jsontype');

const Asset = { name: 'Asset' };

const Customer = {
    name:        'Customer',
    description: 'A customer.',

    fields: (/*{ Mixed, ObjectId }*/) => ({
        name: {
            description: 'The name of the customer.',

            type:     String,
            required: true
        },

        value: Number
    }),

    dynamicFields: ({ ObjectId }) => ({
        assets: {
            type: [ObjectId],
            ref:  Asset.name
        }
    })
};

const CustomerWithoutDynamic = {
    name:        'Customer',
    description: 'A customer.',

    fields: (/*{ Mixed, ObjectId }*/) => ({
        name: {
            description: 'The name of the customer.',

            type:     String,
            required: true
        },

        value: Number
    })
};

const customerResolvers = {
    assets() {}
};

const resolvers = {
    Customer: customerResolvers
};

const schemaStore = new Map([
    [Asset.name, new GraphQLObjectType(Asset)]
]);

describe('getQLType', () => {
    describe('should return', () => {
        it('String!', () => {
            deepStrictEqual(
                getQLType(new Map, { type: String }),
                new GraphQLNonNull(GraphQLString)
            );
        });

        it('String', () => {
            deepStrictEqual(
                getQLType(new Map, { type: String, required: false }),
                GraphQLString
            );
        });

        it('Float!', () => {
            deepStrictEqual(
                getQLType(new Map, { type: Number }),
                new GraphQLNonNull(GraphQLFloat)
            );
        });

        it('Float', () => {
            deepStrictEqual(
                getQLType(new Map, { type: Number, required: false }),
                GraphQLFloat
            );
        });

        it('Int!', () => {
            deepStrictEqual(
                getQLType(new Map, { type: Date }),
                new GraphQLNonNull(GraphQLInt)
            );
        });

        it('Int', () => {
            deepStrictEqual(
                getQLType(new Map, { type: Date, required: false }),
                GraphQLInt
            );
        });

        it('Boolean!', () => {
            deepStrictEqual(
                getQLType(new Map, { type: Boolean }),
                new GraphQLNonNull(GraphQLBoolean)
            );
        });

        it('Boolean', () => {
            deepStrictEqual(
                getQLType(new Map, { type: Boolean, required: false }),
                GraphQLBoolean
            );
        });

        it('JSON!', () => {
            deepStrictEqual(
                getQLType(new Map, { type: Mixed }),
                new GraphQLNonNull(GraphQLJSON)
            );
        });

        it('JSON', () => {
            deepStrictEqual(
                getQLType(new Map, { type: Mixed, required: false }),
                GraphQLJSON
            );
        });

        it('ID!', () => {
            deepStrictEqual(
                getQLType(new Map, { type: ObjectId }),
                new GraphQLNonNull(GraphQLID)
            );
        });

        it('ID', () => {
            deepStrictEqual(
                getQLType(new Map, { type: ObjectId, required: false }),
                GraphQLID
            );
        });

        it('refType!', () => {
            const schemaStore = new Map([[
                Asset.name, new GraphQLObjectType(Asset)
            ]]);
            deepStrictEqual(
                getQLType(schemaStore, { type: ObjectId, ref: Asset.name }),
                new GraphQLNonNull(schemaStore.get(Asset.name))
            );
        });

        it('refType', () => {
            deepStrictEqual(
                getQLType(schemaStore, {
                    type: ObjectId, ref: Asset.name, required: false
                }),
                schemaStore.get(Asset.name)
            );
        });

        it('ID!', () => {
            deepStrictEqual(
                getQLType(new Map, { type: ObjectId }),
                new GraphQLNonNull(GraphQLID)
            );
        });

        it('[String]!', () => {
            deepStrictEqual(
                getQLType(new Map, {
                    type:     [{ type: String }],
                    required: false
                }),
                new GraphQLList(
                    new GraphQLNonNull(
                        GraphQLString
                    )
                )
            );
        });

        it('[Float!]', () => {
            deepStrictEqual(
                getQLType(new Map, { type: [Number], required: false }),
                new GraphQLList(new GraphQLNonNull(GraphQLFloat))
            );
        });

        it('[Boolean]!', () => {
            deepStrictEqual(
                getQLType(new Map, { type: [{ type: Boolean, required: false }] }),
                new GraphQLNonNull(new GraphQLList(GraphQLBoolean))
            );
        });

        it('[refType!]!', () => {
            deepStrictEqual(
                getQLType(schemaStore, { type: [ObjectId], ref: Asset.name }),
                new GraphQLNonNull(
                    new GraphQLList(
                        new GraphQLNonNull(schemaStore.get(Asset.name))
                    )
                )
            );
        });

        it('null', () => {
            deepStrictEqual(
                getQLType(new Map, { type: {} }),
                null
            );
        });
    });

    describe('should throw', () => {
        it('without schemaStore', () => throws(getQLType));

        it('with bad schemaStore', () => throws(() => getQLType({})));

        it('without type', () => throws(() => getQLType(new Map)));
    });
});

describe('buildFields', () => {
    describe('should return', () => {
        it('a field schema', () => {
            const allFields = Object.assign(
                Customer.fields({}),
                Customer.dynamicFields({ ObjectId })
            );

            deepStrictEqual(
                buildFields(schemaStore, allFields, customerResolvers), [{
                    name: {
                        description: 'The name of the customer.',
                        type:        new GraphQLNonNull(GraphQLString)
                    }
                }, {
                    value: {
                        type: new GraphQLNonNull(GraphQLFloat)
                    }
                }, {
                    assets: {
                        type: new GraphQLNonNull(new GraphQLList(
                            new GraphQLNonNull(schemaStore.get(Asset.name))
                        )),

                        resolve: customerResolvers.assets
                    }
                }]
            );
        });
    });

    describe('should throw', () => {
        it('without schemaStore', () => throws(buildFields));

        it('with bad schemaStore', () => throws(() => buildFields({})));

        it('without fields', () => throws(() => buildFields(new Map)));
    });
});

describe('buildType', () => {
    describe('should return', () => {
        it('a type schema', () => {
            const customerType = buildType(schemaStore, Customer, resolvers);

            strictEqual(customerType.name, Customer.name);
            strictEqual(customerType.description, Customer.description);

            assert(customerType._typeConfig.fields instanceof Function);

            strictEqual(
                customerType._typeConfig.fields().assets.resolve,
                customerResolvers.assets
            );
        });

        it('a type schema without dynamic fileds and resolvers', () => {
            const customerType = buildType(
                schemaStore, CustomerWithoutDynamic);

            strictEqual(customerType.name, Customer.name);
            strictEqual(customerType.description, Customer.description);

            assert(customerType._typeConfig.fields instanceof Function);

            equal(customerType._typeConfig.fields().assets, null);
        });
    });

    describe('should throw', () => {
        it('without schemaStore', () => throws(buildType));

        it('with bad schemaStore', () => throws(() => buildType({})));

        it('without typeSchema', () => throws(() => buildType(new Map)));

        it('with bad typeSchema', () => throws(() => buildType(new Map, {})));
    });
});

describe('buildTypes', () => {
    describe('should return', () => {
        it('type schemas', () => {
            const { Customer: customerType } = buildTypes({
                Asset,
                Customer
            }, resolvers);

            strictEqual(customerType.name, Customer.name);
            strictEqual(customerType.description, Customer.description);

            assert(customerType._typeConfig.fields instanceof Function);

            strictEqual(
                customerType._typeConfig.fields().assets.resolve,
                customerResolvers.assets
            );
        });
    });

    describe('should throw', () => {
        it('without schema', () => throws(buildTypes));
    });
});

describe('types', () => {
    it('Mixed should work', () => {
        strictEqual(Mixed.inspect(), 'Mixed');
    });

    it('ObjectId should work', () => {
        strictEqual(ObjectId.inspect(), 'ObjectId');
    });
});
