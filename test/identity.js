var Hapi = require('hapi');

var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();

require('../server.js')({host: 'localhost', port: 80}, function(err, server) {
  if (err) {
    throw err;
  }

  lab.experiment('identity', function() {
    lab.test('can be created', function (done) {
      server.inject({ method: "POST", url: "/identity", payload: {
        username: 'username', password: 'password', email: 'email@example.com'
      }}, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result).to.equal('not implemented yet');
        done();
      });
    });
  });
});
