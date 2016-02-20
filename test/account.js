var Hapi = require('hapi');

var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();

var server = new Hapi.Server();

server.connection({
  host: 'localhost',
  port: 80
});

server.register([
  {register: require('../plugins/account.js'), options: {}}
], function(err) {
  if (err) {
    throw err;
  }

  lab.experiment('account', function() {
    lab.test('can be created', function (done) {
      server.inject({ method: "POST", url: "/account", payload: {
        username: 'username', password: 'password', email: 'email@example.com'
      }}, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result).to.equal('not implemented yet');
        done();
      });
    });
  });
});
