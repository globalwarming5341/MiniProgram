
const __ = {
    poolDict: Symbol('pool')
}

let instance;

export default class Pool {
    constructor() {
        if (instance) {
            return instance;
        }
        instance = this;
        this[__.poolDict] = {};
    }

    getPoolBySign(name) {
        return this[__.poolDict][name] || (this[__.poolDict][name] = []);
    }

    recover(name, obj) {
        this[__.poolDict][name].push(obj);
    }
}