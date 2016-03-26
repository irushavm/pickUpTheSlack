"use strict";
var http = require('http');
var dispatcher = require('httpdispatcher');
var config = require('./config.json');
var request = require('request');

var PORT = process.env.PORT || 5000;

function handleRequest(request, response){
    try {
        console.log(request.url);
        dispatcher.dispatch(request, response);
    } catch(err) {
        response.writeHead(500,{'Content-Type':'plain/text'});
        return response.end('The office is not online :(');
    }
}

var server = http.createServer(handleRequest);

server.listen(PORT, function(){
    console.log('Server listening on: http://localhost:%s', PORT);
});

dispatcher.onGet('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  return res.end(JSON.stringify({status:'online',timeStamp:new Date()}));
});

dispatcher.onPost('/ping', function(req, res) {
  if(req.params.token === config.SLACK_VALIDATION_TOKEN &&
    req.params.team_domain === config.SLACK_TEAM_DOMAN &&
    req.params.command === config.SLACK_COMMAND) {
    var currTime = new Date().getHours()*60 + new Date().getMinutes();
    if((currTime < config.END_TIME && currTime > config.START_TIME) || req.params.text === 'force') {
      request({'url':config.REMOTE_URL+req.url,
      'method':'POST',
      'params': req.params,
      'headers': req.headers,
      'form': req.body,
      'timeout': 500
      },function(err,result,resultBody){
        if(err) {
          res.writeHead(500,{'Content-Type':'plain/text'});
          return res.end('The office is not online :(');
        }
        console.log(result);
        res.writeHead(result.statusCode,result.headers);
        return res.end(resultBody);
      })
      .on('error', function(err) {
        console.log(err);
        res.writeHead(500,{'Content-Type':'plain/text'});
        return res.end('The office is not online :(');
      });
    }else {
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end('The Office is currently closed. it is open between ' + Math.floor(config.START_TIME/60) + ':' + config.START_TIME % 60 + ' and ' +  Math.floor(config.END_TIME/60) + ':' + config.END_TIME % 60 );
    }
  }else {
    res.writeHead(401);
    return res.end('Unauthorized');
  }
});

dispatcher.onError(function(req, res) {
  res.writeHead(404);
});
