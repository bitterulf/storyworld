var pluginName = 'public plugin';

exports.register = function (server, options, next) {
  server.route({
    method: 'GET',
    path: '/{param*}',
    config: {
      tags: [pluginName],
      description: 'default route to retrieve static files',
      handler: {
        directory: {
          path: '.',
          redirectToSlash: true,
          index: true
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
