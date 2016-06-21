// index.js - UI server and API interface
var express = require('express');
var http = require('http')
var serveStatic = require("serve-static");

var counter = 0

var app = express(); 
app.use(serveStatic(__dirname + "/.")); 

// Endpoint 'count' - retrieve current count and store locally
app.get('/count', function (req, res) {
	var options = {
		host: "pgapi",
		port: 8888,
		path: "/data"
	}
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

app.listen(3000);
console.log('Server running on http://0.0.0.0:3000/');

// updateCount - Send an updated count to PostGres
function updateCount(count) {
	counter = count
	var countObj = JSON.stringify({
	  Count: counter
	})
	var request = new http.ClientRequest({
		hostname: "pgapi",
		port: 8888,
		path: "/data",
		method: "POST",
		headers: {
			"Content-Type": "application/json",
			"Content-Length": Buffer.byteLength(countObj)
		}
	})
	request.end(countObj)
}
