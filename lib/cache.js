class Cache {
    /**
     * Cache For Internal Use
     * @param {object} [options]
     */
    constructor(options) {
        this.options = options || null
        this.cache = {}
    }
    /**
     * @param {string} cacheKey
     * @returns {object}
     */
    get(cacheKey) {
        return this.cache[cacheKey]
    }
    /**
     *
     * @param {string} cacheKey
     * @param {object} object
     * @returns {void}
     */
    set(cacheKey, object) {
        this.cache[cacheKey] = object
    }
}

module.exports = Cache
