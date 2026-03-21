const Redis = require('ioredis');

const redis = new Redis({
    host: "127.0.0.1",
    port: 6379
});

module.exports = redis;
// can be used to blacklist, whiltelist of tokens and session storage
// key: value (get and del) key, value (set) in redis