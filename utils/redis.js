var Redis = require('ioredis');

function createRedisClient() {
  var client = new Redis(process.env.REDIS_URL);

  client.on('error', function (err) {
      console.log("Error " + err);
  });

  client.on('connect', function() {
      console.log('connected');
  });
  return client;
}

module.exports = createRedisClient;
