'use strict';

function getProjection(fieldASTs) {
    if (fieldASTs == null
        || !Array.isArray(fieldASTs.fieldNodes)
        || fieldASTs.fieldNodes.length === 0
        || fieldASTs.fieldNodes[0].selectionSet == null
        || !Array.isArray(fieldASTs.fieldNodes[0].selectionSet.selections)
    ) return {};

    return fieldASTs.fieldNodes[0].selectionSet.selections.reduce(
        (projections, selection) => {
            projections[selection.name.value] = 1;
            return projections;
        }, {});
}

module.exports = {
    getProjection
};
