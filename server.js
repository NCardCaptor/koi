var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');

// Create the express app 
var app = express();

// Add Middlewhere for REST Api
app.use(bodyParser.urlencoded({
	extended: true
}));
app.use(bodyParser.json());

// Routes
var userRoutes = require('./app/routes/user.routes.js');
var loginRoutes = require('./app/routes/login.routes.js');

// usage
app.use(express.static(__dirname + '/public'));
app.use('/koi', userRoutes);
app.use('/koi', loginRoutes);


// listen to port
app.listen(3000, function () {
	console.log('Listening on port 3000...');
});