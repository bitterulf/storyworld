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
        data.provider = {};

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

  server.route({
    method: 'POST',
    path: '/story/{storyId}/provider',
    config: {
      tags: [pluginName],
      description: 'route to add another provider to a story',
      validate: {
        payload: {
          sessionId: Joi.string().required(),
          name: Joi.string().required()
        },
        params: {
          storyId: Joi.string().min(7).max(14)
        }
      },
      handler: function (request, reply) {
        var db = request.story;
        var query = {username: request.username, id: request.params.storyId};

        db.find(query, function(err, docs) {
          if (err) return reply(err);

          if (docs.length) {
            var providerId = shortid.generate();
            var setData = {};
            setData['provider.'+providerId] = { name: request.payload.name, actions: {} };

            db.update(query, { $set: setData }, {}, function (err, numReplaced) {
              if (err) return reply(err);
              reply(providerId);
            });
          }
          else {
            reply(Boom.notFound('story does not exists'));
          }
        });
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/story/{storyId}/provider/{providerId}/action',
    config: {
      tags: [pluginName],
      description: 'route to add another action to a provider',
      validate: {
        payload: {
          sessionId: Joi.string().required(),
          name: Joi.string().required()
        },
        params: {
          storyId: Joi.string().min(7).max(14),
          providerId: Joi.string().min(7).max(14)
        }
      },
      handler: function (request, reply) {
        var db = request.story;
        var query = {username: request.username, id: request.params.storyId};

        db.find(query, function(err, docs) {
          if (err) return reply(err);

          if (docs.length) {
            if (!docs[0].provider[request.params.providerId]) {
              return reply(Boom.notFound('provider does not exists'));
            }
            var actionId = shortid.generate();
            var setData = {};
            setData['provider.'+request.params.providerId+'.actions.'+actionId] = { name: request.payload.name, events: {} };

            db.update(query, { $set: setData }, {}, function (err, numReplaced) {
              if (err) return reply(err);
              reply(actionId);
            });
          }
          else {
            reply(Boom.notFound('story does not exists'));
          }
        });
      }
    }
  });

  server.route({
    method: 'POST',
    path: '/story/{storyId}/provider/{providerId}/action/{actionId}/event',
    config: {
      tags: [pluginName],
      description: 'route to add another event to a action',
      validate: {
        payload: {
          sessionId: Joi.string().required(),
          name: Joi.string().required()
        },
        params: {
          storyId: Joi.string().min(7).max(14),
          providerId: Joi.string().min(7).max(14),
          actionId: Joi.string().min(7).max(14)
        }
      },
      handler: function (request, reply) {
        var db = request.story;
        var query = {username: request.username, id: request.params.storyId};

        db.find(query, function(err, docs) {
          if (err) return reply(err);

          if (docs.length) {
            if (!docs[0].provider[request.params.providerId]) {
              return reply(Boom.notFound('provider does not exists'));
            }
            if (!docs[0].provider[request.params.providerId].actions[request.params.actionId]) {
              return reply(Boom.notFound('action does not exists'));
            }
            var eventId = shortid.generate();
            var setData = {};
            setData['provider.'+request.params.providerId+'.actions.'+request.params.actionId+'.events.'+eventId] = { name: request.payload.name };

            db.update(query, { $set: setData }, {}, function (err, numReplaced) {
              if (err) return reply(err);
              reply(eventId);
            });
          }
          else {
            reply(Boom.notFound('story does not exists'));
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
