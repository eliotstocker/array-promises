const test = require('ava');
const sinon = require('sinon');
const nycTransformer = require('./nycTransformer');
const sandboxedModule = require('sandboxed-module');
const axios = require('axios');

const ArrayPromises = require('../index');

test('apply adds asyncMap to array prototype', t => {
    const ArrayStub = sinon.stub();

    ArrayPromises.apply(ArrayStub);

    const instance = new ArrayStub();

    t.is(instance.asyncMap.toString().split('{', 1)[0].replace(/\s/g,''), 'function(iterator,maxInFlight)');
});

test('asyncMap can produce the same results as map given the same input (wrapped in a promise)', t => {
    const array = [1, 2, 3, 4];

    const iterator = (item, index) => item + index;

    const mapped = array.map(iterator);

    return ArrayPromises.asyncMap(array, iterator)
        .then(asyncMapped => {
            t.deepEqual(mapped, asyncMapped);
        })
});

test('asyncMap can run iteration with an async function', t => {
    const fakeAsync = sinon.stub().resolvesArg(0);

    const array = [1, 2, 3, 4];

    const iterator = async (item, index) => {
        const val = await fakeAsync(item);
        return val + index;
    };

    return ArrayPromises.asyncMap(array, iterator)
        .then(asyncMapped => {
            t.deepEqual([1, 3, 5, 7], asyncMapped);
        });
});

test('asyncMap can run iteration with an http fetch promise', t => {
    const array = [1, 2, 3, 4];

    const iterator = (item) => {
        return axios('http://www.mocky.io/v2/5e84bbf23000008e0a97abbe')
            .then((response) => response.data)
            .then(({number}) => item + number);
    };

    return ArrayPromises.asyncMap(array, iterator)
        .then(asyncMapped => {
            t.deepEqual([2, 3, 4, 5], asyncMapped);
        });
});

test('asyncMap can be set to not run all iterations at the same time', t => {
    const asyncReduceSpy = sinon.spy(ArrayPromises.asyncReduce);
    const sandboxedAsyncMap = sandboxedModule.require('../src/asyncMap', {
        singleOnly: true,
        requires: {
            './asyncReduce': asyncReduceSpy
        },
        sourceTransformers: nycTransformer
    });

    const array = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];

    const iterator = (item) => {
        return axios('http://www.mocky.io/v2/5e84bbf23000008e0a97abbe')
            .then((response) => response.data)
            .then(({number}) => item + number);
    };

    return sandboxedAsyncMap(array, iterator, 2)
        .then(asyncMapped => {
            t.true(asyncReduceSpy.calledOnce);
            t.deepEqual(asyncReduceSpy.args[0][0], [[1, 2], [3,4], [5, 6], [7,8], [9, 10]]);

            t.deepEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11], asyncMapped);
        });
});
