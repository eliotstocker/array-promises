# Asynchronous Array Functions | array-promises

A small array utility functions to create asynchronous versions of common array functions

## Included Functions

1. [asyncMap](#asyncMap)
2. [asyncReduce](#asyncReduce)

## Usages

you can use the functions directly from the package ie `arrayPromises.asyncMap(array, iterator);`
or you can use the provided [apply](#apply) method to add asyncMap and asyncReduce to the Array class

### apply

when you run the apply function with no parameters it will attempt to update the Array prototype and add both asyncMap 
and asyncReduce to the standard Array functions.

you may also provide a class you wish to add these functions to, please not that internally they will still use array 
map and reduce so a map and reduce compatible function will need to exist on any class that you apply to.

#### Example
```js
//node require
const {apply} = require('array-promises');
apply();

//Array objects crated after running apply will now have asyncMap and asyncReduce
const array = [1, 2, 3, 4];
console.log(typeof array.asyncMap); //will log function
console.log(typeof array.asyncReduce); //will log function
```

### asyncMap

`asyncMap` works more or less the same as `map` you will provide an iterator function (can be async or not) and it will
return a promise which will resolve with your mapped values.

### Example (assumes you have run apply method)
```js
const array = [1, 2, 3, 4, 5];

//An example using promises
array.asyncMap((item) => {
    if (item % 2 === 0) {
        return item; //you can return a non async value this will work just fine
    }
    return aMethodThatRetunsAPromise(item)
        .then(({returnedValue}) => returnedValue);
})
    .then(output => console.log(output));

//the same example using async await
const output = await array.asyncMap(async (item) => {
    if (item % 2 === 0) {
        return item; //you can return a non async value this will work just fine
    }
    const {returnedValue} = await aAsyncMethod(item);

    return returnedValue;
});
console.log(output);
```

#### maxInFlight

one difference with asyncMap is that you may wish to not run all of your operations at the same time like map
traditionally does, for this a third argument you may send the number of items you wish to have in flight at any one
time, this will cause the async functions to be chunked into groups of this size and then chained one after another.

for instance, if you have an array with 100 values and you set max in flight to 10, it will first run your async 
iterator against the first 10 items in the array, and then the next, concatenating each of set onto the last.

the returned array should look identical to if you had not set maxInFlight, but if you are for instance hitting a server
not all requests will be made at once.

### asyncReduce

`asyncReduce` works more or less the same as `reduce` you will provide an iterator function (can be async or not) and an 
accumulator and it will return a promise which will resolve with the final output of the accumulator

### Example (assumes you have run apply method)
```js
const array = [1, 2, 1, 2, 3, 2, 1, 2, 1, 1, 3];

//An example using promises
array.asyncReduce((acc, item) => {
    if(!acc[item]) {
        return someAsyncMethod(item).
            then(data => Object.assign(acc, {[item]: {...data, count: 1}}));
    }

    acc[item].count = 1;

    return acc;
}, {})
    .then(output => console.log(output));

//the same example using async await
const output = await array.asyncReduce((acc, item) => {
    if(!acc[item]) {
        const data = await someAsyncMethod(item)
        return Object.assign(acc, {[item]: {...data, count: 1}})
    }

    acc[item].count = 1; //you can return a non async value this will work just fine

    return acc;
}, {})
console.log(output);
```
