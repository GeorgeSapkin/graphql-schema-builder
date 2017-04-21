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
    GraphQLInputObjectType,
    GraphQLList,
    GraphQLNonNull,
    GraphQLObjectType,
    GraphQLString
} = require('graphql');

const {
    GraphQLDateTime
} = require('graphql-iso-date');

const {
    buildFields,
    buildSubType: _buildSubType,
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

const nop = () => {};

const Asset = { name: 'Asset' };

const Customer = {
    name:        'Customer',
    description: 'A customer.',

    fields: {
        name: {
            description: 'The name of the customer.',

            type:     String,
            required: true
        },

        value: Number
    },

    dynamicFields: ({ ObjectId }) => ({
        assets: {
            type: [ObjectId],
            ref:  Asset.name
        }
    })
};

const CustomerFunNoDyn = {
    name: 'Customer',

    fields: ({ Mixed }) => ({
        name: Mixed
    })
};

const CustomerObjNoDyn = {
    name: 'Customer',

    fields: {
        name: String
    }
};

const CustomerFunObj = {
    name: 'Customer',

    fields: ({ Mixed }) => ({
        name: Mixed
    }),

    dynamicFields: {
        assets: [String]
    }
};

const CustomerObjFun = {
    name: 'Customer',

    fields: {
        name: String
    },

    dynamicFields: ({ ObjectId }) => ({
        assets: [ObjectId]
    })
};

const CustomerNested = {
    name: 'Customer',

    fields: {
        metadata: {
            created: {
                type:     Date,
                required: true
            }
        }
    }
};

const AssetNested = {
    name: 'Asset',

    fields: {
        metadata: {
            created: {
                type:     Date,
                required: true
            }
        }
    }
};

const BadAssetNested = {
    name: 'Asset',

    fields: {
        metadata: {
            updated: {
                type: Date
            }
        }
    }
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
                getQLType(nop, { type: String }),
                new GraphQLNonNull(GraphQLString)
            );
        });

        it('String', () => {
            deepStrictEqual(
                getQLType(nop, { type: String, required: false }),
                GraphQLString
            );
        });

        it('Float!', () => {
            deepStrictEqual(
                getQLType(nop, { type: Number }),
                new GraphQLNonNull(GraphQLFloat)
            );
        });

        it('Float', () => {
            deepStrictEqual(
                getQLType(nop, { type: Number, required: false }),
                GraphQLFloat
            );
        });

        it('DateTime!', () => {
            deepStrictEqual(
                getQLType(nop, { type: Date }),
                new GraphQLNonNull(GraphQLDateTime)
            );
        });

        it('DateTime', () => {
            deepStrictEqual(
                getQLType(nop, { type: Date, required: false }),
                GraphQLDateTime
            );
        });

        it('Boolean!', () => {
            deepStrictEqual(
                getQLType(nop, { type: Boolean }),
                new GraphQLNonNull(GraphQLBoolean)
            );
        });

        it('Boolean', () => {
            deepStrictEqual(
                getQLType(nop, { type: Boolean, required: false }),
                GraphQLBoolean
            );
        });

        it('JSON!', () => {
            deepStrictEqual(
                getQLType(nop, { type: Mixed }),
                new GraphQLNonNull(GraphQLJSON)
            );
        });

        it('JSON', () => {
            deepStrictEqual(
                getQLType(nop, { type: Mixed, required: false }),
                GraphQLJSON
            );
        });

        it('ID!', () => {
            deepStrictEqual(
                getQLType(nop, { type: ObjectId }),
                new GraphQLNonNull(GraphQLID)
            );
        });

        it('ID', () => {
            deepStrictEqual(
                getQLType(nop, { type: ObjectId, required: false }),
                GraphQLID
            );
        });

        it('refType!', () => {
            const getExistingType = () => new GraphQLObjectType(Asset);

            deepStrictEqual(
                getQLType(getExistingType, {
                    type: ObjectId,
                    ref:  Asset.name
                }),
                new GraphQLNonNull(schemaStore.get(Asset.name))
            );
        });

        it('refType', () => {
            const getExistingType = () => schemaStore.get(Asset.name);

            deepStrictEqual(
                getQLType(getExistingType, {
                    type: ObjectId, ref: Asset.name, required: false
                }),
                schemaStore.get(Asset.name)
            );
        });

        it('ID!', () => {
            deepStrictEqual(
                getQLType(nop, { type: ObjectId }),
                new GraphQLNonNull(GraphQLID)
            );
        });

        it('[String]!', () => {
            deepStrictEqual(
                getQLType(nop, {
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
                getQLType(nop, { type: [Number], required: false }),
                new GraphQLList(new GraphQLNonNull(GraphQLFloat))
            );
        });

        it('[Boolean]!', () => {
            deepStrictEqual(
                getQLType(nop, { type: [{ type: Boolean, required: false }] }),
                new GraphQLNonNull(new GraphQLList(GraphQLBoolean))
            );
        });

        it('[refType!]!', () => {
            const getExistingType = () => schemaStore.get(Asset.name);

            deepStrictEqual(
                getQLType(getExistingType, {
                    type: [ObjectId],
                    ref:  Asset.name
                }),
                new GraphQLNonNull(
                    new GraphQLList(
                        new GraphQLNonNull(schemaStore.get(Asset.name))
                    )
                )
            );
        });

        it('null', () => {
            deepStrictEqual(
                getQLType(nop, { type: {} }),
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
        const getExistingType = schemaStore.get.bind(schemaStore);

        it('a field schema from object fields', () => {
            const allFields = Object.assign(
                Customer.fields,
                Customer.dynamicFields({ ObjectId })
            );

            deepStrictEqual(
                buildFields(allFields, {
                    getExistingType,

                    resolvers: customerResolvers
                }), {
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

        it('a field schema from function fields', () => {
            deepStrictEqual(
                buildFields(Customer.dynamicFields, {
                    getExistingType,

                    resolvers: customerResolvers
                }), {
                    assets: {
                        type: new GraphQLNonNull(new GraphQLList(
                            new GraphQLNonNull(schemaStore.get(Asset.name))
                        )),

                        resolve: customerResolvers.assets
                    }
                }
            );
        });

        it('a field schema from nested fields', () => {
            const fields = buildFields(CustomerNested.fields);
            assert(fields.metadata.type instanceof GraphQLInputObjectType);
        });
    });

    describe('should throw', () => {
        it('without fields', () => throws(buildFields));

        it('without buildSubType', () => throws(() => buildFields({}, {
            buildSubType: null
        })));
        it('without buildSubType', () => throws(() => buildFields({}, {
            buildSubType:    nop,
            getExistingType: null
        })));
    });
});

describe('buildType', () => {
    describe('should return', () => {
        it('a type schema with resolvers', () => {
            const customerType = buildType(Customer, {
                resolvers
            });

            strictEqual(customerType.name, Customer.name);
            strictEqual(customerType.description, Customer.description);

            assert(customerType._typeConfig.fields instanceof Function);

            strictEqual(
                customerType._typeConfig.fields().assets.resolve,
                customerResolvers.assets
            );
        });

        it('a type schema (fun/no-dyn)', () => {
            const customerType = buildType(CustomerFunNoDyn);

            strictEqual(customerType.name, Customer.name);

            assert(customerType._typeConfig.fields instanceof Function);

            deepStrictEqual(
                customerType._typeConfig.fields().name.type,
                new GraphQLNonNull(GraphQLJSON));
            equal(customerType._typeConfig.fields().assets, null);
        });

        it('a type schema (obj/no-dyn)', () => {
            const customerType = buildType(CustomerObjNoDyn);

            strictEqual(customerType.name, Customer.name);

            assert(customerType._typeConfig.fields instanceof Function);

            deepStrictEqual(
                customerType._typeConfig.fields().name.type,
                new GraphQLNonNull(GraphQLString));
            equal(customerType._typeConfig.fields().assets, null);
        });

        it('a type schema (fun/obj)', () => {
            const customerType = buildType(CustomerFunObj);

            strictEqual(customerType.name, Customer.name);

            assert(customerType._typeConfig.fields instanceof Function);

            deepStrictEqual(
                customerType._typeConfig.fields().name.type,
                new GraphQLNonNull(GraphQLJSON));
            equal(customerType._typeConfig.fields().assets.resolve, null);
        });

        it('a type schema (obj/fun)', () => {
            const customerType = buildType(CustomerObjFun);

            strictEqual(customerType.name, Customer.name);

            assert(customerType._typeConfig.fields instanceof Function);

            deepStrictEqual(
                customerType._typeConfig.fields().name.type,
                new GraphQLNonNull(GraphQLString));
            equal(customerType._typeConfig.fields().assets.resolve, null);
        });

        it('a nested type schema', () => {
            const customerType = buildType(CustomerNested, {});

            strictEqual(customerType.name, Customer.name);

            assert(customerType._typeConfig.fields instanceof Function);

            assert(
                customerType._typeConfig.fields().metadata.type
                    instanceof GraphQLInputObjectType);
        });

        it('a nested type schema with duplicate sub type', () => {
            const localSchemaStore = new Map;

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

            strictEqual(assetType.name,    Asset.name);
            strictEqual(customerType.name, Customer.name);

            assert(assetType._typeConfig.fields    instanceof Function);
            assert(customerType._typeConfig.fields instanceof Function);

            assert(
                assetType._typeConfig.fields().metadata.type
                    instanceof GraphQLObjectType);

            deepStrictEqual(
                assetType._typeConfig.fields().metadata,
                customerType._typeConfig.fields().metadata);
        });
    });

    describe('should throw', () => {
        it('without typeSchema', () => throws(buildType));

        it('with bad typeSchema', () => throws(() => buildType({})));

        it('without buildSubType', () => throws(() => buildType({}, {
            buildSubType: null
        })));

        it('without getExistingType', () => throws(() => buildType({}, {
            buildSubType:    nop,
            getExistingType: null
        })));

        it('with different sub type', () => {
            const localSchemaStore = new Map;

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

            throws(() => buildType(BadAssetNested, {
                buildSubType,
                getExistingType
            })._typeConfig.fields());
        });
    });
});

describe('buildSubType', () => {
    it('should return type', () => {
        const localSchemaStore = new Map;
        const buildSubType = _buildSubType(localSchemaStore);

        buildSubType(Customer);

        assert(
            localSchemaStore.get(Customer.name) instanceof GraphQLObjectType);
    });

    it('should throw without schemaStore', () => throws(_buildSubType));
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
