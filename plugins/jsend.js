var _ = require('underscore');

var pluginName = 'jsend plugin';

exports.register = function (server, options, next) {
  server.ext({
    type: 'onPreResponse',
    method: function (request, reply) {
      var response = request.response;
      if (response.variety != 'file') {
        if (response.isBoom) {
          return reply({status: 'error', message: response.message, code: response.output.payload.statusCode});
        }
        else if (_.isObject(response.source) || _.isArray(response.source)) {
          return reply({status: 'success', data: response.source});
        }
        else {
          return reply({status: 'success', data: response.source});
        }
      }
      else {
        return reply.continue();
      }
    }
  });

  next();
};

exports.register.attributes = {
  name: pluginName,
  version: '1.0.0'
};
