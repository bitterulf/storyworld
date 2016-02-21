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
        Code.expect(response.result.status).to.equal('success');
        Code.expect(response.result.data).to.equal('identity created');
        done();
      });
    });
    lab.test('can only be created once with the same username', function (done) {
      server.inject({ method: "POST", url: "/identity", payload: {
        username: 'username', password: 'password', email: 'email@example.com'
      }}, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.status).to.equal('error');
        Code.expect(response.result.message).to.equal('username already taken');
        Code.expect(response.result.code).to.equal(409);
        done();
      });
    });
    lab.test('can get a session id with those credentials', function (done) {
      server.inject({ method: "POST", url: "/identity/session", payload: {
        username: 'username', password: 'password'
      }}, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.status).to.equal('success');
        Code.expect(response.result.message).not.to.equal('invalid identity');
        Code.expect(response.result.data.length).to.equal(40);
        sessionIds.push(response.result.data);
        done();
      });
    });
      lab.test('can not get a session id with wrong credentials', function (done) {
      server.inject({ method: "POST", url: "/identity/session", payload: {
        username: 'username', password: 'wrongpassword'
      }}, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.status).to.equal('error');
        Code.expect(response.result.message).to.equal('invalid identity');
        Code.expect(response.result.code).to.equal(401);
        done();
      });
    });
    lab.test('session id can be validated afterwards', function (done) {
      server.inject({ method: "POST", url: "/identity/session/test", payload: {
        sessionId: sessionIds[0]
      }}, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.status).to.equal('success');
        Code.expect(response.result.data).to.equal('passed');
        done();
      });
    });
    lab.test('can get a another session id with those credentials', function (done) {
      server.inject({ method: "POST", url: "/identity/session", payload: {
        username: 'username', password: 'password'
      }}, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.status).to.equal('success');
        Code.expect(response.result.message).not.to.equal('invalid identity');
        Code.expect(response.result.data.length).to.equal(40);
        sessionIds.push(response.result.data);
        done();
      });
    });
    lab.test('old session id can not be validated afterwards', function (done) {
      server.inject({ method: "POST", url: "/identity/session/test", payload: {
        sessionId: sessionIds[0]
      }}, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.status).to.equal('error');
        Code.expect(response.result.message).to.equal('failed');
        Code.expect(response.result.code).to.equal(403);
        done();
      });
    });
    lab.test('new session id is still valid', function (done) {
      server.inject({ method: "POST", url: "/identity/session/test", payload: {
        sessionId: sessionIds[1]
      }}, function(response) {
        Code.expect(response.statusCode).to.equal(200);
        Code.expect(response.result.status).to.equal('success');
        Code.expect(response.result.data).to.equal('passed');
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
        Code.expect(response.result.status).to.equal('error');
        Code.expect(response.result.message).to.equal('failed');
        Code.expect(response.result.code).to.equal(403);
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
        Code.expect(response.result.status).to.equal('success');
        Code.expect(response.result.message).not.to.equal('invalid identity');
        Code.expect(response.result.data.length).to.equal(40);
        sessionIds.push(response.result.data);
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
        Code.expect(response.result.status).to.equal('success');
        Code.expect(response.result.data).to.equal('passed');
        done();
      });
    });
  });
});
