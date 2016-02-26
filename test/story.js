var Code = require('code');
var Lab = require('lab');
var lab = exports.lab = Lab.script();
var _ = require('underscore');

var createStoryFromData = function(data) {
  var Story = function(id, data) {
    this.id = id;
    this.data = data;
  };

  var Result = function(id, data) {
    this.id = id;
    this.data = data;
  };

  var Action = function(id, data) {
    this.id = id;
    this.data = data;
  };

  var Content = function(id, data) {
    this.id = id;
    this.data = data;
  };

  var Provider = function(id, data) {
    this.id = id;
    this.data = data;
  };

  var Event = function(id, data) {
    this.id = id;
    this.data = data;
  };

  Action.prototype.getEventByIndex = function(index) {
    var eventKeys = _.keys(this.data.events);
    if (eventKeys.length >= index + 1) {
      return new Event(eventKeys[index], this.data.events[eventKeys[index]]);
    }
    return null;
  };

  Provider.prototype.getActionByIndex = function(index) {
    var actionKeys = _.keys(this.data.actions);
    if (actionKeys.length >= index + 1) {
      return new Action(actionKeys[index], this.data.actions[actionKeys[index]]);
    }
    return null;
  };

  Provider.prototype.getContentByIndex = function(index) {
    var contentKeys = _.keys(this.data.contents);
    if (contentKeys.length >= index + 1) {
      return new Content(contentKeys[index], this.data.contents[contentKeys[index]]);
    }
    return null;
  };

  Story.prototype.getResultByIndex = function(index) {
    var resultKeys = _.keys(this.data.results);
    if (resultKeys.length >= index + 1) {
      return new Result(resultKeys[index], this.data.results[resultKeys[index]]);
    }
    return null;
  };

  Story.prototype.getProviderByIndex = function(index) {
    var providerKeys = _.keys(this.data.provider);
    if (providerKeys.length >= index + 1) {
      return new Provider(providerKeys[index], this.data.provider[providerKeys[index]]);
    }
    return null;
  };

  return new Story(data.id, data);
};

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

var isValidId = function(id) {
  Code.expect(id.length).to.equal(14);
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
  var actionId;
  var contentId;
  var resultId;

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
          isValidId(response.result.data);
          storyId = response.result.data;
          done();
        });
      });
    });
    lab.test('can have results to be created into', function (done) {
      createSessionId(server, function(err, sid) {
        sessionId = sid;
        server.inject({ method: "POST", url: "/story/"+storyId+"/result", payload: {
          sessionId: sessionId,
          name: 'first result',
          key: 'location',
          events: ['walking_to'],
          type: 'last'
        }}, function(response) {
          expectSuccessResponse(response);
          isValidId(response.result.data);
          resultId = response.result.data;
          done();
        });
      });
    });
    lab.test('can have providers to be created into', function (done) {
      createSessionId(server, function(err, sid) {
        sessionId = sid;
        server.inject({ method: "POST", url: "/story/"+storyId+"/provider", payload: {
          sessionId: sessionId,
          name: 'first provider',
          key: 'location',
          type: 'eq',
          value: 'forest'
        }}, function(response) {
          expectSuccessResponse(response);
          isValidId(response.result.data);
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
          isValidId(response.result.data);
          actionId = response.result.data;
          done();
        });
      });
    });
    lab.test('can have contents to be created into providers', function (done) {
      createSessionId(server, function(err, sid) {
        sessionId = sid;
        server.inject({ method: "POST", url: "/story/"+storyId+"/provider/"+providerId+"/content", payload: {
          sessionId: sessionId,
          name: 'first content'
        }}, function(response) {
          expectSuccessResponse(response);
          isValidId(response.result.data);
          contentId = response.result.data;
          done();
        });
      });
    });
    lab.test('can have events to be created into actions', function (done) {
      createSessionId(server, function(err, sid) {
        sessionId = sid;
        server.inject({ method: "POST", url: "/story/"+storyId+"/provider/"+providerId+"/action/"+actionId+"/event", payload: {
          sessionId: sessionId,
          name: 'first event'
        }}, function(response) {
          expectSuccessResponse(response);
          isValidId(response.result.data);
          done();
        });
      });
    });
    lab.test('can retrieve the created stories', function (done) {
      server.inject({ method: "GET", url: "/stories?sessionId="+sessionId}, function(response) {
        expectSuccessResponse(response);

        var story = createStoryFromData(response.result.data[0]);
        var result = story.getResultByIndex(0);
        var provider = story.getProviderByIndex(0);
        var content = provider.getContentByIndex(0);
        var action = provider.getActionByIndex(0);
        var event = action.getEventByIndex(0);

        Code.expect(story.data.name).to.equal('first story');
        Code.expect(story.data.username).to.equal('username');
        isValidId(story.id);
        Code.expect(result.data.name).to.equal('first result');
        isValidId(result.id);
        Code.expect(provider.data.name).to.equal('first provider');
        isValidId(provider.id);
        Code.expect(content.data.name).to.equal('first content');
        isValidId(story.id);
        Code.expect(action.data.name).to.equal('first action');
        isValidId(action.id);
        Code.expect(event.data.name).to.equal('first event');
        isValidId(event.id);
        done();
      });
    });
    lab.test('can create a story instance from a story', function (done) {
      server.inject({ method: "POST", url: "/storyInstance", payload: {
          sessionId: sessionId,
          storyId: storyId
        }}, function(response) {
        expectSuccessResponse(response);
        isValidId(response.result.data);
        done();
      });
    });
    lab.test('can retrieve a created instances', function (done) {
      server.inject({ method: "GET", url:"/storyInstances?sessionId="+sessionId }, function(response) {
        expectSuccessResponse(response);
        isValidId(response.result.data[0].id);
        done();
      });
    });
  });
});
