// Cisco Shipped sample three-tier application UI server
// Change the assignments below if you change the API server service name
// or port number from the default
var express = require('express');
var http = require('http')
var serveStatic = require("serve-static");

var counter = 0
var UI_PORT = 3000
//Getting data from env HOST_VOTE_API
var API_SERVICE_NAME = process.env.HOST_VOTE_API;
var DEPLOY_TARGET = process.env.DEPLOY_TARGET;
//trim https:// or http:// 
if(API_SERVICE_NAME != undefined)
{
	API_SERVICE_NAME = API_SERVICE_NAME.substring(API_SERVICE_NAME.indexOf("//")+2);
}
var app = express()
app.use(serveStatic(__dirname + "/."))
var apiport=80
if (DEPLOY_TARGET.indexOf("LOCAL_SANDBOX") > -1){
		apiport=8888
		API_SERVICE_NAME = "vote_api";
}
// Endpoint 'count' - retrieve current count and store locally
app.get('/count', function (req, res) {
	var options = {
	  host: API_SERVICE_NAME,
	  port: apiport,
	  path: '/data'
	};
	http.get(options, function(getres) {	
	  getres.on("data", function(chunk) {
	    counter = JSON.parse(chunk).Data.Count
	    res.json({Count: counter})
	  }).on('error', function(e) {
	    console.log("Got error: " + e.message);
		counter = 0
	    res.json({Count: counter})
	  });
	});
});

// Endpoint 'like' - increment count
app.post('/like', function (req, res) {
	updateCount(counter+1)
	res.json({Count: counter})
});

// Endpoint 'reset' - set count to zero
app.post('/reset', function (req, res) {
	updateCount(0)
	res.json({Count: counter})
});

app.listen(UI_PORT);
console.log('Shipped three-tier UI server listening on port ' + UI_PORT);

// updateCount - Send an updated count to PostGres
function updateCount(count) {
	counter = count
	var countObj = JSON.stringify({
	  Count: counter
	})
	
	var request = new http.ClientRequest({
		hostname: API_SERVICE_NAME,
		port: apiport,
		path: "/data",
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Content-Length": Buffer.byteLength(countObj)
		}
	})
	request.end(countObj)
}
