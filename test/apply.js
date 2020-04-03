const test = require('ava');
const sinon = require('sinon');
const arrayPromises = require('../index');

arrayPromises.apply();

test('Adds asyncMap to Array Prototype', t => {
    t.is(typeof Array.prototype.asyncMap, 'function');
});

test('Adds asyncReduce to Array Prototype', t => {
    t.is(typeof Array.prototype.asyncReduce, 'function');
});

test('asyncMap correctly binds this, and allows array to be iterated upon', t => {
    const array = [1, 2, 3, 4];

    return array.asyncMap(item => item + 1)
        .then(out => {
            t.deepEqual([2, 3, 4, 5], out);
        });
});

test('asyncReduce correctly binds this, and allows array to be iterated upon', t => {
    const array = [1, 2, 3, 4];

    return array.asyncReduce((acc, item) => acc + item, 0)
        .then(out => {
            t.is(10, out);
        });
});

test("can apply to something that isn't Array", t => {
    class ArrayLike {
        constructor() {
            this.map = sinon.stub().returns([Promise.resolve(true)]);
            this.reduce = sinon.stub().resolves(true);
        }
    }

    arrayPromises.apply(ArrayLike);

    t.is(typeof ArrayLike.prototype.asyncMap, 'function');
    t.is(typeof ArrayLike.prototype.asyncReduce, 'function');

    const arrayLike = new ArrayLike();

    return Promise.all([
        arrayLike.asyncMap(item => item + 1),
        arrayLike.asyncReduce((acc, item) => acc + item, 0)
    ])
        .then(() => {
            t.true(arrayLike.map.calledOnce);
            t.true(arrayLike.reduce.calledOnce);
        });
});
