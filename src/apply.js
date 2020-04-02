const asyncMap = require('./asyncMap');
const asyncReduce = require('./asyncReduce');

module.exports = (array = Array) => {
    array.prototype.asyncMap = (iterator) => {
        return asyncMap(this, iterator);
    };

    array.prototype.asyncReduce = (iterator, accumulator) => {
        return asyncReduce(this, iterator, accumulator);
    };
};
