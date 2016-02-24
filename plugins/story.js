var Joi = require('joi');
var Boom = require('boom');
var passwordHash = require('password-hash');
var sha1 = require("crypto-js/sha1");
var shortid = require('shortid');

var pluginName = 'story plugin';

var generateId = function() {
  var id = String("00000000000000" + shortid.generate()).slice(-14);
  return id;
};

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

        data.id = generateId();
        data.username = request.username;
        data.provider = {};
        data.results = {};

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
    path: '/story/{storyId}/result',
    config: {
      tags: [pluginName],
      description: 'route to add another result to a story',
      validate: {
        payload: {
          sessionId: Joi.string().required(),
          name: Joi.string().required(),
          key: Joi.string().regex(/^[a-zA-Z0-9-_]{1,20}$/).required(),
          events: Joi.array().items(Joi.string().regex(/^[a-zA-Z0-9-_]{1,20}$/)).min(1),
          type: Joi.string().valid('sum', 'last').required()
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
            var resultId = generateId();
            var setData = {};
            setData['results.'+resultId] = { name: request.payload.name };

            db.update(query, { $set: setData }, {}, function (err, numReplaced) {
              if (err) return reply(err);
              reply(resultId);
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
    path: '/story/{storyId}/provider',
    config: {
      tags: [pluginName],
      description: 'route to add another provider to a story',
      validate: {
        payload: {
          sessionId: Joi.string().required(),
          name: Joi.string().required(),
          key: Joi.string().regex(/^[a-zA-Z0-9-_]{1,20}$/).required(),
          type: Joi.string().valid('eq', 'gt', 'gte', 'lt', 'lte', 'ne').required(),
          value: Joi.string().required()
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
            var providerId = generateId();
            var setData = {};
            setData['provider.'+providerId] = { name: request.payload.name, actions: {}, contents: {} };

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
            var actionId = generateId();
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
    path: '/story/{storyId}/provider/{providerId}/content',
    config: {
      tags: [pluginName],
      description: 'route to add another content to a provider',
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
            var contentId = generateId();
            var setData = {};
            setData['provider.'+request.params.providerId+'.contents.'+contentId] = { name: request.payload.name, events: {} };

            db.update(query, { $set: setData }, {}, function (err, numReplaced) {
              if (err) return reply(err);
              reply(contentId);
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
            var eventId = generateId();
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
