"use strict";
var fs = require('fs');
var http = require('http');
var dispatcher = require('httpdispatcher');
// var config = require('./config.json');

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

dispatcher.onGet('/audio/hello.mp3', function (req,res){
  console.log('Getting Audio');
  console.log(req.url);
  var path = __dirname + '/public' + req.url;
   fs.stat(path, function(err, stat){
       if( err ) {
           res.writeHead(404, {'Content-Type': 'text/html'});
           res.end(''+err);
       } else {
           res.writeHead(200, {
               'Content-Type': 'audio',
               'Content-Length': stat.size});
           var stream = fs.createReadStream(path);
           stream.pipe(res);
       }
   } );
});

dispatcher.onGet('/', function(req, res) {
  res.writeHead(200, {'Content-Type': 'application/json'});
  res.end(JSON.stringify({status:'online',timeStamp:new Date()}));
});

dispatcher.onPost('/ping', function(req, res) {
  console.log('HEADERS\n----------');
  console.log(req.headers);
  console.log('PARAMS\n----------');
  console.log(req.params);
  console.log('BODY\n----------');
  console.log(req.body);

  // res.writeHead(200, {'Content-Type': 'text/plain'});
  res.end('');
});

dispatcher.onError(function(req, res) {
  res.writeHead(404);
});
