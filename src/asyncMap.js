module.exports = (array, iteratorFn) => {
    return Promise.all(array.map((...args) => {
        const fn = iteratorFn(...args);

        if(typeof fn.then !== 'function') {
            return Promise.resolve(fn);
        }

        return fn;
    }));
};
