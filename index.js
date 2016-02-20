var Path = require('path');
var Hapi = require('hapi');
var nconf = require('nconf');

nconf.argv().env().defaults({
  'host': 'localhost',
  'port': 80
});

var server = new Hapi.Server({
  connections: {
    routes: {
      files: {
        relativeTo: Path.join(__dirname, 'public')
      }
    }
  }
});

server.connection({
  host: nconf.get('host'),
  port: nconf.get('port')
});

server.register([require('vision'), require('inert'), { register: require('lout') }], function(err) {
  server.register([{
    register: require('./plugins/public.js'),
    options: {}
  }], function(err) {
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
});
