'use strict';
var os = require('os');
var http = require('http');
var dispatcher = require('httpdispatcher');
var Player = require('player');
var config = require('../config.json');
var audioFileLocation = '../' + config.AUDIO_FILE_LOCATION;
var nextTime = 0;
var currTime;
var notifyTimeout;
var PORT = process.env.PORT || 5050;

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

dispatcher.onPost('/ping', function(req, res) {
  if(req.params.token === config.SLACK_VALIDATION_TOKEN) {

    //determine the notify TIMEOUT based on the priority (normal or force)
    notifyTimeout = req.params.text === 'force' ? config.NOTIFY_FORCE_TIMEOUT_SECONDS: config.NOTIFY_TIMEOUT_SECONDS;

    currTime = new Date().getTime();
    if( currTime > nextTime) {
      nextTime = currTime + notifyTimeout*1000;
      //Check if running on Windows
      if(os.type()==='Windows_NT') {
        var edge = require('edge');
        var windowsPlayer = edge.func(function() {/*
            async (input) => {
                var player = new System.Media.SoundPlayer((string)input);
                return new {
                    start = (Func<object,Task<object>>)(async (i) => {
                        player.Play();
                        return null;
                    }),
                    stop = (Func<object,Task<object>>)(async (i) => {
                        player.Stop();
                        return null;
                    })
                };
            }
        */});
        var winPlayer = windowsPlayer(audioFileLocation, true);
        winPlayer.start(null, function (err) {
            if (err) throw err;
            console.log('Started playing');
            res.writeHead(200);
            res.end('Office Ping\'d!');
        });

        setTimeout(function () {
            winPlayer.stop(null, function(err) {
                if (err) throw err;
                console.log('Stopped playing');
            });
        }, 25000);
      }
      //If running on Linux or OSX
      else {
        var player = new Player(audioFileLocation);
        player.play();
        player.on('playing',function(item){ // jshint ignore:line
          console.log('Pinging office!');
          res.writeHead(200, {'Content-Type': 'application/json'});
          res.end(JSON.stringify({
            'response_type': 'in_channel',
            'text': 'Office Ping\'d!'
          }));
        });

        // event: on error
        player.on('error', function(err){
          if(err !== 'No next song was found'){
            console.log('Unable to play track');
            console.log(err);
            res.writeHead(500);
            res.end('Internal Server Error');
          }
        });
      }
    }else{
      res.writeHead(200, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({
        'response_type': 'ephemeral',
        'text': 'Slow down there cowboy. You can ping the office in ' + Math.floor((nextTime-currTime)/1000).toString() + ' seconds.'
      }));
    }
  }else {
    res.writeHead(401);
    res.end('Unauthorized');
  }
});

dispatcher.onError(function(req, res) {
  res.writeHead(404);
  res.end('Method Not Found');
});
