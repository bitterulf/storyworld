var Joi = require('joi');
var Boom = require('boom');
var passwordHash = require('password-hash');
var sha1 = require("crypto-js/sha1");
var shortid = require('shortid');

var pluginName = 'story plugin';

exports.register = function (server, options, next) {
  server.decorate('request', 'story', server.app.createDataStore());

  server.route({
    method: 'POST',
    path: '/story',
    config: {
      tags: [pluginName],
      description: 'route to create a story',
      validate: {
        payload: Joi.object().keys({
          sessionId: Joi.string().required(),
          name: Joi.string().regex(/^[a-zA-Z0-9 ]{5,30}$/).required()
        })
      },
      handler: function (request, reply) {
        var data = request.payload;
        var db = request.story;

        data.id = shortid.generate();
        data.username = request.username;

        db.insert(data, function(err, doc) {
          if (err) return reply(err);
          reply(doc.id);
        });
      }
    }
  });

  server.route({
    method: 'GET',
    path: '/stories',
    config: {
      tags: [pluginName],
      description: 'route to retrieve all stories',
      validate: {
        query: {
          sessionId: Joi.string().required()
        }
      },
      handler: function (request, reply) {
        var db = request.story;

        db.find({}, function(err, docs) {
          if (err) return reply(err);
          reply(docs);
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
