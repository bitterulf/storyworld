var nconf = require('nconf');

nconf.argv().env().defaults({
  'host': 'localhost',
  'port': 80
});

var options = {
  host: nconf.get('host'),
  port: nconf.get('port')
};

require('./server.js')(options, function(err, server) {
  if (err) {
    throw err;
  }
  server.start(function(err) {
    if (err) {
      throw err;
    }
    console.log('Server running at:', server.info.uri);
  });
});
