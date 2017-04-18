# graphql-schema-builder

Builds GraphQL types based on Mongoose-like schema and a resolver list thus separating type schema from resolvers.

Type's `fields` can be used to build Mongoose schema by calling it with `mongoose.Schema.Types` or mechanically converted into any other schemas.

*NB:* All types are assumed to have an implicit `id` field.

## Usage

```bash
npm install --save graphql-schema-builder
```

```js
const {
    buildTypes,
    getProjection,

    GraphQLJSON
} = require('graphql-schema-builder');

function getSchema(resolvers, schema, { customerProvider }) {
    const types = buildTypes(resolvers, domain);

    return new GraphQLSchema({
        query: new GraphQLObjectType({
            name: 'RootQueryType',
            fields: {
                customer: {
                    type: types.Customer,
                    args: {
                        id: {
                            name: 'id',
                            type: new GraphQLNonNull(GraphQLID)
                        }
                    },

                    resolve(_0, { id }, _1, fieldASTs) {
                        const projections = getProjection(fieldASTs);
                        return customerProvider.findById(id, projections);
                    }
                },
                customers: {
                    type: new GraphQLList(types.Customer),

                    resolve(_0, {}, _1, fieldASTs) {
                        const projections = getProjection(fieldASTs);
                        return customerProvider.findAll(projections);
                    }
                }
            }
        }),

        /* mutations, etc. */
    });
}

```

## Schema example

```js
const schema = {
    Asset: {
        name:        'Asset',
        description: 'An asset.',

        fields: ({ Mixed, ObjectId }) => ({
            customer: {
                description: 'Customer that this asset belongs to.',

                type:     ObjectId,
                ref:      'Customer',
                required: true
            },

            parent: {
                type:     ObjectId,
                ref:      'Asset',
                required: false
            },

            name: {
                type:     String,
                required: true
            },

            description: {
                type:     String,
                required: false
            },

            model: {
                type:     String,
                required: false
            }
        }),

        dynamicFields: ({ ObjectId }) => ({
            sensors: {
                type: [ObjectId],
                ref:  'Sensor'
            }
        })
    },

    Customer: {
        name:        'Customer',
        description: 'A customer.',

        fields: ({ Mixed, ObjectId }) => ({
            name: {
                description: 'The name of the customer.',

                type:     String,
                required: true
            }
        }),

        dynamicFields: ({ ObjectId }) => ({
            assets: {
                type: [ObjectId],
                ref:  'Asset'
            }
        })
    },

    Sensor: {
        name:        'Sensor',
        description: 'A sensor that must be connected to an asset.',

        fields: ({ Mixed, ObjectId }) => ({
            externalId: {
                type:     String,
                required: false
            },

            asset: {
                description: 'An asset that this sensor is connected to.',

                type:     ObjectId,
                ref:      'Asset',
                required: true
            },

            name: {
                type:     String,
                required: false
            },

            model: {
                type:     String,
                required: false
            }
        })
    }
}
```

## Resolvers example

```js
const resolvers = {
    Asset: {
        customer(obj, {}, _, fieldASTs) {
            const projection = getProjection(fieldASTs);
            return customerProvider.findById(obj.customer, projection);
        },

        parent(obj, {}, _, fieldASTs) {
            if (obj.parent != null)
                return null;

            const projection = getProjection(fieldASTs);
            return assetProvider.findById(obj.parent, projection);
        },

        sensors(obj, {}, _, fieldASTs) {
            const projection = getProjection(fieldASTs);
            return sensorProvider._find({
                _id: obj.parent
            }, projection);
        }
    },

    Customer: {
        assets(obj, {}, _, fieldASTs) {
            const projection = getProjection(fieldASTs);
            return assetProvider._find({
                _id: obj.parent
            }, projection);
        }
    },

    Sensor: {
        asset(obj, {}, _, fieldASTs) {
            const projection = getProjection(fieldASTs);
            return assetProvider.findById(obj.parent, projection);
        }
    }
}
```

## Supported schema types

- Array of any of supported types
- Boolean
- Date
- Mixed
- Number
- ObjectId
- String
