'use strict';

const {
  buildFields
} = require('./buildfields');

const {
  buildTypes
} = require('./buildtypes');

const {
  GraphQLJSON
} = require('./jsontype');

const {
  getProjection
} = require('./projection');

function buildExports(graphql) {
  return {
    buildFields: buildFields(graphql),
    buildTypes:  buildTypes(graphql),
    GraphQLJSON: GraphQLJSON(graphql),

    getProjection
  };
}

module.exports = buildExports;
