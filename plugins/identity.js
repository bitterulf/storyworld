var Joi = require('joi');
var Datastore = require('nedb');

var pluginName = 'account plugin';

exports.register = function (server, options, next) {
  var store = new Datastore();

  server.decorate('request', 'identity', {
    find: function(query, cb) {
      store.find(query, cb);
    }
  });

  server.route({
    method: 'POST',
    path: '/identity',
    config: {
      tags: [pluginName],
      description: 'route to create a account',
      validate: {
        payload: Joi.object().keys({
          username: Joi.string().regex(/^[a-zA-Z0-9_\-]{5,30}$/).required(),
          password: Joi.string().regex(/^[a-zA-Z0-9!$%&?*;:_\-.,#+|@=]{5,30}$/).required(),
          email: Joi.string().email().required()
        })
      },
      handler: function (request, reply) {
        request.identity.find({}, function(err, result) {
          reply(result);
        });
      }
    }
  });

  next();
};

exports.register.attributes = {
  name: pluginName,
  version: '1.0.0'
};
