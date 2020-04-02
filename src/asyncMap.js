const asyncReduce = require('./asyncReduce');

function chunkArray (arr, len) {
    const chunks = [];
    let i = 0;
    let n = arr.length;

    while (i < n) {
        chunks.push(arr.slice(i, i += len));
    }

    return chunks;
}

const asyncMap = (array, iteratorFn, maxInFlight) => {
    if(typeof maxInFlight === 'number' && array.length > maxInFlight) {
        const chunks = chunkArray(array, maxInFlight);

        return asyncReduce(chunks, (acc, chunk) => {
            return asyncMap(chunk, iteratorFn)
                .then(data => acc.concat(data));
        }, []);
    }

    return Promise.all(array.map((...args) => {
        const fn = iteratorFn(...args);

        if(typeof fn.then !== 'function') {
            return Promise.resolve(fn);
        }

        return fn;
    }));
};

module.exports = asyncMap;
