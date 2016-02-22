var Joi = require('joi');
var Boom = require('boom');
var passwordHash = require('password-hash');
var sha1 = require("crypto-js/sha1");

var pluginName = 'identity plugin';

exports.register = function (server, options, next) {
  server.ext({
    type: 'onPreHandler',
    method: function (request, reply) {
      var sessionContainer;

      if (request.payload && request.payload.sessionId) {
        sessionContainer = 'payload';
      }
      else if (request.query && request.query.sessionId) {
        sessionContainer = 'query';
      }

      if (sessionContainer) {
        var db = request.identity;
        db.find({ip: request.info.remoteAddress, sessionId: request[sessionContainer].sessionId}, function(err, result) {
          if (err) return reply(err);

          if (!result.length) {
            return reply(Boom.unauthorized('invalid identity'));
          }
          else {
            request.username = result[0].username;
          }
          return reply.continue();
        });
      }
      else {
        return reply.continue();
      }
    }
  });

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
        data.password = passwordHash.generate(data.password);

        var db = request.identity;
        db.find({username: data.username}, function(err, result) {
          if (err) return reply(err);

          if (result.length) {
             reply(Boom.conflict('username already taken'));
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

  server.route({
    method: 'POST',
    path: '/identity/session',
    config: {
      tags: [pluginName],
      description: 'route to retrieve a session id for an identity',
      validate: {
        payload: Joi.object().keys({
          username: Joi.string().regex(/^[a-zA-Z0-9_\-]{5,30}$/).required(),
          password: Joi.string().regex(/^[a-zA-Z0-9!$%&?*;:_\-.,#+|@=]{5,30}$/).required()
        })
      },
      handler: function (request, reply) {
        var data = request.payload;
        var db = request.identity;

        db.find({username: data.username}, function(err, result) {
          if (err) return reply(err);

          if (!result.length || !passwordHash.verify(data.password, result[0].password)) {
            reply(Boom.unauthorized('invalid identity'));
          }
          else {
            var hash = sha1((new Date()).valueOf().toString() + Math.random().toString()).toString();
            var ip = request.info.remoteAddress;

            db.update({username: data.username}, {$set:{ ip: ip, sessionId: hash }}, {}, function(err, numReplaced) {
              if (err) return reply(err);
              reply(hash);
            });
          }
        });
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/identity/session/test',
    config: {
      tags: [pluginName],
      description: 'route to test a session id',
      handler: function (request, reply) {
        if (!request.username) {
          reply(Boom.forbidden('failed'));
        }
        else {
          reply('passed');
        }
      }
    }
  });

  next();
};

exports.register.attributes = {
  name: pluginName,
  version: '1.0.0'
};
