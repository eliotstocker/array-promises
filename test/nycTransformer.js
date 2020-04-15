'use strict';
const NYC = require('nyc');
const crypto = require('crypto');

function maybeCoverage() {
    return Object.keys(require.cache).some((path) => (/node_modules\/nyc/).test(path));
}

module.exports = maybeCoverage() ? {
    nyc(source) {
        const hash = crypto.createHash('md5').update(source).digest("hex");
        const instrumenter = new NYC({}).instrumenter();
        const sourceMap = {}

        if (this._sourceMap) {
            sourceMap.sourceMap = this.sourceMaps.extract(source, this.filename)
            sourceMap.registerMap = () => this.sourceMaps.registerMap(this.filename, hash, sourceMap.sourceMap)
        } else {
            sourceMap.registerMap = () => {}
        }

        return instrumenter.instrumentSync(source, this.filename, sourceMap);
    }
} : {};
