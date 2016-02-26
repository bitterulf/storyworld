var Joi = require('joi');
var Boom = require('boom');
var shortid = require('shortid');

var pluginName = 'story instance plugin';

var generateId = function() {
  var id = String("00000000000000" + shortid.generate()).slice(-14);
  return id;
};

var sessionIdValidator = Joi.string().required();
var idValidator = Joi.string().min(14).max(14);

exports.register = function (server, options, next) {
  server.decorate('request', 'storyInstance', server.app.createDataStore());

  server.route({
    method: 'POST',
    path: '/storyInstance',
    config: {
      tags: [pluginName],
      description: 'route to create a story instance',
      validate: {
        payload: Joi.object().keys({
          storyId: idValidator,
          sessionId: sessionIdValidator
        })
      },
      handler: function (request, reply) {
        var data = request.payload;
        var db = request.storyInstance;

        request.story.count({id: request.payload.storyId}, function(err, count) {
          if (err) return reply(err);
          if (count) {
            var data = {
              id: generateId(),
              username: request.username,
              events: [],
              date: new Date()
            };
            db.insert(data, function(err, doc) {
              if (err) return reply(err);
              reply(doc.id);
            });
          }
          else {
            return reply(Boom.notFound('story does not exists'));
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
