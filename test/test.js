const test = require('ava');
const sinon = require('sinon');
const axios = require('axios');

const AsyncArrays = require('../index');

test('apply adds asyncMap to array prototype', t => {
    const ArrayStub = sinon.stub();

    AsyncArrays.apply(ArrayStub);

    const instance = new ArrayStub();

    t.is(instance.asyncMap.toString(), ((iterator) => {
        return asyncMap(this, iterator);
    }).toString());
});

test('apply adds asyncReduce to array prototype', t => {
    const ArrayStub = sinon.stub();

    AsyncArrays.apply(ArrayStub);

    const instance = new ArrayStub();

    t.is(instance.asyncReduce.toString(), ((iterator, accumulator) => {
        return asyncReduce(this, iterator, accumulator);
    }).toString());
});

test('asyncMap can produce the same results as map given the same input (wrapped in a promise)', t => {
    const array = [1, 2, 3, 4];

    const iterator = (item, index) => item + index;

    const mapped = array.map(iterator);

    return AsyncArrays.asyncMap(array, iterator)
        .then(asyncMapped => {
            t.deepEqual(mapped, asyncMapped);
        })
});

test('asyncReduce can produce the same results as reduce given the same input (wrapped in a promise)', t => {
    const array = [1, 2, 3, 4];

    const iterator = (acc, item) => acc + item;

    const reduced = array.reduce(iterator, 0);

    return AsyncArrays.asyncReduce(array, iterator, 0)
        .then(asyncReduced => {
            t.is(reduced, asyncReduced);
        });
});

test('asyncMap can run iteration with an async function', t => {
    const fakeAsync = sinon.stub().resolvesArg(0);

    const array = [1, 2, 3, 4];

    const iterator = async (item, index) => {
        const val = await fakeAsync(item);
        return val + index;
    };

    return AsyncArrays.asyncMap(array, iterator)
        .then(asyncMapped => {
            t.deepEqual([1, 3, 5, 7], asyncMapped);
        });
});

test('asyncReduce can run iteration with an async function', t => {
    const fakeAsync = sinon.stub().resolvesArg(0);

    const array = [1, 2, 3, 4];

    const iterator = async (acc, item) => {
        const val = await fakeAsync(item);
        return val + acc;
    };

    return AsyncArrays.asyncReduce(array, iterator, 0)
        .then(asyncReduced => {
            t.is(10, asyncReduced);
        });
});

test('asyncMap can run iteration with an http fetch promise', t => {
    const array = [1, 2, 3, 4];

    const iterator = (item) => {
        return axios('http://www.mocky.io/v2/5e84bbf23000008e0a97abbe')
            .then((response) => response.data)
            .then(({number}) => item + number);
    };

    return AsyncArrays.asyncMap(array, iterator)
        .then(asyncMapped => {
            t.deepEqual([2, 3, 4, 5], asyncMapped);
        });
});

test('asyncReduce can run iteration with an http fetch promise', t => {
    const array = [1, 2, 3, 4];

    const iterator = (acc, item) => {
        return axios('http://www.mocky.io/v2/5e84bbf23000008e0a97abbe')
            .then((response) => response.data)
            .then(({number}) => acc + item + number);
    };

    return AsyncArrays.asyncReduce(array, iterator, 0)
        .then(asyncMapped => {
            t.deepEqual(14, asyncMapped);
        });
});
