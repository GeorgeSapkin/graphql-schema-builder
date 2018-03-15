'use strict';

const {
  GraphQLObjectType
} = require('graphql');

const nop = () => {};

const Asset = { name: 'Asset' };

const AssetWithMeasurements = {
  name: 'Asset',

  fields: ({ ObjectId }) => ({
    measurements: {
      type: [ObjectId],
      ref:  'Measurement'
    }
  })
};

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

const AssetNestedArray = {
  name: 'Asset',

  fields: {
    metadatas: [{
      created: {
        type:     Date,
        required: true
      }
    }]
  }
};

const AssetNestedType = {
  name: 'Asset',

  fields: {
    metadata: {
      type: {
        created: {
          type:     Date,
          required: true
        }
      }
    }
  }
};

const AssetNestedArrayType = {
  name: 'Asset',

  fields: {
    metadatas: {
      type: [{
        created: {
          type:     Date,
          required: true
        }
      }],
      required: false
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

const Measurement = {
  name: 'Measurement'
};

const customerResolvers = {
  assets() {}
};

const assetResolvers = {
  measurements: {
    resolve() {}
  }
};

const assetResolversWithArgs = {
  measurements: {
    args: {
      resolution: {
        type:     String,
        required: true
      }
    },

    resolve() {}
  }
};

const assetResolversWithArgsAsFunc = {
  measurements: {
    args: () => ({
      time: {
        type:     Date,
        required: false
      }
    }),

    resolve() {}
  }
};

const resolvers = {
  Customer: customerResolvers
};

const schemaStore = new Map([
  [Asset.name,       new GraphQLObjectType(Asset)],
  [Measurement.name, new GraphQLObjectType(Measurement)]
]);

module.exports = {
  Asset,
  AssetNested,
  AssetNestedType,
  AssetNestedArray,
  AssetNestedArrayType,
  assetResolvers,
  assetResolversWithArgs,
  assetResolversWithArgsAsFunc,
  AssetWithMeasurements,
  BadAssetNested,
  Customer,
  CustomerFunNoDyn,
  CustomerFunObj,
  CustomerNested,
  CustomerObjFun,
  CustomerObjNoDyn,
  customerResolvers,
  Measurement,
  nop,
  resolvers,
  schemaStore
};
