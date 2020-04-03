const asyncMap = require('./asyncMap');
const asyncReduce = require('./asyncReduce');

module.exports = (array = Array) => {
    array.prototype.asyncMap = function(iterator, maxInFlight) {
        return asyncMap(this, iterator, maxInFlight);
    };

    array.prototype.asyncReduce = function(iterator, accumulator) {
        return asyncReduce(this, iterator, accumulator);
    };
};
