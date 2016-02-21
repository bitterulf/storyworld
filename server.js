module.exports = function (options, cb) {
  var Path = require('path');
  var Hapi = require('hapi');

  var server = new Hapi.Server({
    connections: {
      routes: {
        files: {
          relativeTo: Path.join(__dirname, 'public')
        }
      }
    }
  });

  server.app.name = 'storyworld';

  server.connection({
    host: options.host,
    port: options.port
  });

  server.register([require('vision'), require('inert'), { register: require('lout') }], function(err) {
    server.register([
      {register: require('./plugins/public.js'), options: {}},
      {register: require('./plugins/identity.js'), options: {}}
    ], function(err) {
      cb(err, server);
    });
  });
};
