"use strict";
var http = require('http');
var dispatcher = require('httpdispatcher');
var config = require('./config.json');

var PORT = process.env.PORT || 5000;

function handleRequest(request, response){
    try {
        console.log(request.url);
        dispatcher.dispatch(request, response);
    } catch(err) {
        console.log(err);
    }
}

var server = http.createServer(handleRequest);

server.listen(PORT, function(){
    console.log('Server listening on: http://localhost:%s', PORT);
});

dispatcher.onGet('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({status:'online',timeStamp:new Date()}));
});

dispatcher.onPost('/ping', function(req, res) {

  if(req.params.token === config.slackValidationToken) {
    res.redirect(config.remoteURL+req.url);
  }else {
    res.writeHead(401);
    res.end('Unauthorized');
  }
});

dispatcher.onError(function(req, res) {
  res.writeHead(404);
});
