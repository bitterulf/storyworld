var Path = require('path');
var Hapi = require('hapi');
var Datastore = require('nedb');

module.exports = function (options, cb) {

  var server = new Hapi.Server({
    connections: {
      routes: {
        files: {
          relativeTo: Path.join(__dirname, 'public')
        }
      }
    }
  });

  server.app.createDataStore = function() {
    var store = new Datastore();

    return {
      count: function(query, cb) {
        store.count(query, cb);
      },
      find: function(query, cb) {
        store.find(query, cb);
      },
      insert: function(doc, cb) {
        store.insert(doc, cb);
      },
      update: function(query, update, options, cb) {
        store.update(query, update, options, cb);
      }
    };
  };

  server.connection({
    host: options.host,
    port: options.port
  });

  server.register([require('vision'), require('inert'), { register: require('lout') }], function(err) {
    server.register([
      {register: require('./plugins/public.js'), options: {}},
      {register: require('./plugins/jsend.js'), options: {}},
      {register: require('./plugins/identity.js'), options: {}},
      {register: require('./plugins/story.js'), options: {}}
    ], function(err) {
      cb(err, server);
    });
  });
};
