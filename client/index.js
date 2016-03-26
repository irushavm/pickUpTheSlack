'use strict';
var os = require('os');
var http = require('http');
var dispatcher = require('httpdispatcher');
var Player = require('player');
var config = require('../config.json');
var AUDIO_FILE_LOCATION = '../public/audio/hello.mp3';
var lastTime;
var currTime;
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
  console.log(req.params);
  if(req.params.token === config.slackValidationToken) {
    currTime = new Date().getTime();
    if(currTime < lastTime + config.NOTIFY_THRESHOLD) {
      lastTime = currTime;
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
        var winPlayer = windowsPlayer(AUDIO_FILE_LOCATION, true);
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

      }else {
        var player = new Player(AUDIO_FILE_LOCATION);
        player.play();

        player.on('playing',function(item){
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
        'text': 'Slow down there cowboy. You can ping in the office in ' + currTime - lastTime + ' seconds.'
      }));
    }
  }else {
    res.writeHead(401);
    res.end('Unauthorized');
  }
});

dispatcher.onError(function(req, res) {
  res.writeHead(404);
});
