var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var _ = require('underscore');

var expectSuccessResponse = function(response, data) {
  Code.expect(response.statusCode).to.equal(200);
  Code.expect(response.result.status).to.equal('success');
  if (data) {
    Code.expect(response.result.data).to.equal(data);
  }
};

var expectErrorResponse = function(response, statusCode, message) {
  Code.expect(response.statusCode).to.equal(200);
  Code.expect(response.result.status).to.equal('error');
  Code.expect(response.result.code).to.equal(statusCode);
  Code.expect(response.result.message).to.equal(message);
};

var createSessionId = function(server, cb) {
  server.inject({ method: "POST", url: "/identity", payload: {
    username: 'username', password: 'password', email: 'email@example.com'
  }}, function(response) {
    server.inject({ method: "POST", url: "/identity/session", payload: {
      username: 'username', password: 'password'
    }}, function(response) {
      cb(null, response.result.data);
    });
  });
};

require('../server.js')({host: 'localhost', port: 80}, function(err, server) {
  if (err) {
    throw err;
  }

  var sessionId;
  var storyId;
  var providerId;

  lab.experiment('story', function() {
    lab.test('can not be created without a session id', function (done) {
      server.inject({ method: "POST", url: "/story", payload: {
        name: 'first story'
      }}, function(response) {
        expectErrorResponse(response, 400, 'child \"sessionId\" fails because [\"sessionId\" is required]'),
        done();
      });
    });
    lab.test('can not be created with a wrong session id', function (done) {
      server.inject({ method: "POST", url: "/story", payload: {
        sessionId: 'wrong',
        name: 'first story'
      }}, function(response) {
        expectErrorResponse(response, 401, 'invalid identity'),
        done();
      });
    });
    lab.test('can be created with a valid session id', function (done) {
      createSessionId(server, function(err, sid) {
        sessionId = sid;
        server.inject({ method: "POST", url: "/story", payload: {
          sessionId: sessionId,
          name: 'first story'
        }}, function(response) {
          expectSuccessResponse(response);
          Code.expect(response.result.data.length).to.equal(9);
          storyId = response.result.data;
          done();
        });
      });
    });
    lab.test('can have providers to be created into', function (done) {
      createSessionId(server, function(err, sid) {
        sessionId = sid;
        server.inject({ method: "POST", url: "/story/"+storyId+"/provider", payload: {
          sessionId: sessionId,
          name: 'first provider'
        }}, function(response) {
          expectSuccessResponse(response);
          Code.expect(response.result.data.length).to.equal(10);
          providerId = response.result.data;
          done();
        });
      });
    });
    lab.test('can have actions to be created into providers', function (done) {
      createSessionId(server, function(err, sid) {
        sessionId = sid;
        server.inject({ method: "POST", url: "/story/"+storyId+"/provider/"+providerId+"/action", payload: {
          sessionId: sessionId,
          name: 'first action'
        }}, function(response) {
          expectSuccessResponse(response);
          Code.expect(response.result.data.length).to.equal(10);
          done();
        });
      });
    });
    lab.test('can retrieve the created stories', function (done) {
      server.inject({ method: "GET", url: "/stories?sessionId="+sessionId}, function(response) {
        expectSuccessResponse(response);
        Code.expect(response.result.data.length).to.equal(1);

        var storyData = response.result.data[0];

        Code.expect(storyData.name).to.equal('first story');
        Code.expect(storyData.username).to.equal('username');
        Code.expect(storyData.id.length).to.equal(9);
        var providerIds = _.keys(storyData.provider);
        Code.expect(providerIds.length).to.equal(1);
        Code.expect(storyData.provider[providerIds[0]].name).to.equal('first provider');
        done();
      });
    });
  });
});
