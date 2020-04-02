module.exports = (array, iteratorFn, accumulator) => {
    return array.reduce((acc, ...args) => {
        return acc.then(a => iteratorFn(a, ...args));
    }, Promise.resolve(accumulator));
};
