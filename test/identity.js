var Hapi = require('hapi');

var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();

require('../server.js')({host: 'localhost', port: 80}, function(err, server) {
  if (err) {
    throw err;
  }

  var sessionIds = [];

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
        sessionIds.push(response.result);
        done();
      });
    });
    lab.test('session id can be validated afterwards', function (done) {
      server.inject({ method: "POST", url: "/identity/session/test", payload: {
        sessionId: sessionIds[0]
      }}, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result).to.equal('passed');
        done();
      });
    });
    lab.test('can get a another session id with those credentials', function (done) {
      server.inject({ method: "POST", url: "/identity/session", payload: {
        username: 'username', password: 'password'
      }}, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result).not.to.equal('invalid identity');
        Code.expect(response.result.length).to.equal(40);
        sessionIds.push(response.result);
        done();
      });
    });
    lab.test('old session id can not be validated afterwards', function (done) {
      server.inject({ method: "POST", url: "/identity/session/test", payload: {
        sessionId: sessionIds[0]
      }}, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result).to.equal('failed');
        done();
      });
    });
    lab.test('new session id is still valid', function (done) {
      server.inject({ method: "POST", url: "/identity/session/test", payload: {
        sessionId: sessionIds[1]
      }}, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result).to.equal('passed');
        done();
      });
    });
    lab.test('correct session id with wrong ip is invalid', function (done) {
      server.inject({ method: "POST", url: "/identity/session/test",
        remoteAddress: '127.0.0.2',
        payload: {
          sessionId: sessionIds[1]
      }}, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result).to.equal('failed');
        done();
      });
    });
    lab.test('can get a another session id under a different ip', function (done) {
      server.inject({ method: "POST", url: "/identity/session",
        remoteAddress: '127.0.0.2',
        payload: {
          username: 'username', password: 'password'
      }}, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result).not.to.equal('invalid identity');
        Code.expect(response.result.length).to.equal(40);
        sessionIds.push(response.result);
        done();
      });
    });
    lab.test('correct session id with new correct ip is valid', function (done) {
      server.inject({ method: "POST", url: "/identity/session/test",
        remoteAddress: '127.0.0.2',
        payload: {
          sessionId: sessionIds[2]
      }}, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result).to.equal('passed');
        done();
      });
    });
  });
});
