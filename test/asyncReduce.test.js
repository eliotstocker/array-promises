const test = require('ava');
const sinon = require('sinon');
const axios = require('axios');

const ArrayPromises = require('../index');

test('apply adds asyncReduce to array prototype', t => {
    const ArrayStub = sinon.stub();

    ArrayPromises.apply(ArrayStub);

    const instance = new ArrayStub();

    t.is(instance.asyncReduce.toString().split('{', 1)[0].replace(/\s/g,''), 'function(iterator,accumulator)');
});

test('asyncReduce can produce the same results as reduce given the same input (wrapped in a promise)', t => {
    const array = [1, 2, 3, 4];

    const iterator = (acc, item) => acc + item;

    const reduced = array.reduce(iterator, 0);

    return ArrayPromises.asyncReduce(array, iterator, 0)
        .then(asyncReduced => {
            t.is(reduced, asyncReduced);
        });
});

test('asyncReduce can run iteration with an async function', t => {
    const fakeAsync = sinon.stub().resolvesArg(0);

    const array = [1, 2, 3, 4];

    const iterator = async (acc, item) => {
        const val = await fakeAsync(item);
        return val + acc;
    };

    return ArrayPromises.asyncReduce(array, iterator, 0)
        .then(asyncReduced => {
            t.is(10, asyncReduced);
        });
});

test('asyncReduce can run iteration with an http fetch promise', t => {
    const array = [1, 2, 3, 4];

    const iterator = (acc, item) => {
        return axios('http://www.mocky.io/v2/5e84bbf23000008e0a97abbe')
            .then((response) => response.data)
            .then(({number}) => acc + item + number);
    };

    return ArrayPromises.asyncReduce(array, iterator, 0)
        .then(asyncMapped => {
            t.deepEqual(14, asyncMapped);
        });
});

