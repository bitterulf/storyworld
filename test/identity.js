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
        Code.expect(response.result).to.equal('identity created');
        done();
      });
    });
    lab.test('can only be created once with the same username', function (done) {
      server.inject({ method: "POST", url: "/identity", payload: {
        username: 'username', password: 'password', email: 'email@example.com'
      }}, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result).to.equal('username already taken');
        done();
      });
    });
    lab.test('can get a session id with those credentials', function (done) {
      server.inject({ method: "POST", url: "/identity/session", payload: {
        username: 'username', password: 'password'
      }}, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result).not.to.equal('invalid identity');
        Code.expect(response.result.length).to.equal(40);
        done();
      });
    });
    lab.test('can get a session id with those credentials', function (done) {
      server.inject({ method: "POST", url: "/identity/session", payload: {
        username: 'username', password: 'wrongPassword'
      }}, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result).to.equal('invalid identity');
        done();
      });
    });
  });
});
