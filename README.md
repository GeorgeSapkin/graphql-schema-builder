# graphql-schema-builder

[![NPM version][npm-image]][npm-url]
[![Build status][travis-image]][travis-url]
[![Test coverage][coveralls-image]][coveralls-url]
[![Downloads][downloads-image]][downloads-url]

Builds GraphQL types based on Mongoose-like schema and a resolver list thus separating type schema from resolvers. Simplifies defining mutation arguments based on schema types.

Type's `fields` can be used to build Mongoose schema by calling it with `mongoose.Schema.Types` or mechanically converted into any other schemas.

*NB:* All types are assumed to have an implicit `id` field.

## Usage

```bash
npm install --save graphql-schema-builder
```

```js
const {
    buildFields,
    buildTypes,
    getProjection,

    GraphQLJSON
} = require('graphql-schema-builder');

function getSchema(resolvers, schema, { customerProvider }) {
    // build types based on existing domain schemas and resolvers
    const types = buildTypes({
        Asset,
        Customer,
        Sensos
    }, resolvers);

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
                        const projection = getProjection(fieldASTs);
                        return customerProvider.findById(id, projection);
                    }
                },
                customers: {
                    type: new GraphQLList(types.Customer),

                    resolve(_0, {}, _1, fieldASTs) {
                        const projection = getProjection(fieldASTs);
                        return customerProvider.findAll(projection);
                    }
                }
            }
        }),

        mutation: new GraphQLObjectType({
            name: 'Mutation',
            fields: {
                createAsset: {
                    type: types.Asset,
                    // build arguments based on domain schemas instead of
                    // specifying them manually
                    args: buildFields(Asset.fields),

                    resolve(obj, args, source, fieldASTs) {
                        // create asset
                    }
                },

                /* more mutations, etc. */
            }
        })
    });
}

```

## Schema example

`fields` can be either an object or a function accepting `{ Mixed, ObjectId }`. See Mongoose [Guide](http://mongoosejs.com/docs/guide.html) for more details about Schema definition.

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

        fields: {
            name: {
                description: 'The name of the customer.',

                type:     String,
                required: true
            }
        },

        dynamicFields: ({ Mixed, ObjectId }) => ({
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
            return sensorProvider.find({ asset: obj.id }, projection);
        }
    },

    Customer: {
        assets(obj, {}, _, fieldASTs) {
            const projection = getProjection(fieldASTs);
            return assetProvider.find({ customer: obj.id }, projection);
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

## License

MIT

[npm-image]: https://img.shields.io/npm/v/graphql-schema-builder.svg?style=flat-square
[npm-url]: https://npmjs.org/package/graphql-schema-builder
[travis-image]: https://img.shields.io/travis/GeorgeSapkin/graphql-schema-builder.svg?style=flat-square
[travis-url]: https://travis-ci.org/GeorgeSapkin/graphql-schema-builder
[coveralls-image]: https://img.shields.io/coveralls/GeorgeSapkin/graphql-schema-builder.svg?style=flat-square
[coveralls-url]: https://coveralls.io/r/GeorgeSapkin/graphql-schema-builder
[downloads-image]: https://img.shields.io/npm/dm/graphql-schema-builder.svg?style=flat-square
[downloads-url]: https://npmjs.org/package/graphql-schema-builder
