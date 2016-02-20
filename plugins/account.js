var Joi = require('joi');

var pluginName = 'account plugin';

exports.register = function (server, options, next) {
  server.route({
    method: 'POST',
    path: '/account',
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
        return reply('not implemented yet');
      }
    }
  });

  next();
};

exports.register.attributes = {
  name: pluginName,
  version: '1.0.0'
};
