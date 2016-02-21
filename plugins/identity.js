var Joi = require('joi');

var pluginName = 'account plugin';

exports.register = function (server, options, next) {
  server.decorate('request', 'identity', server.app.createDataStore());

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
        var data = request.payload;
        var db = request.identity;
        db.find({username: data.username}, function(err, result) {
          if (err) return reply(err);

          if (result.length) {
            reply('username already taken');
          }
          else {
            db.insert(data, function(err, result) {
              if (err) return reply(err);

              reply('identity created');
            });
          }
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
