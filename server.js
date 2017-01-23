var express = require('express');
var bodyParser = require('body-parser');
var _ = require('lodash');

// Create the express app 
var app = express();

// Add Middlewhere for REST Api
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

// Routes
var userRoutes = require('./app/routes/user.routes.js');

//var allergieRoutes = require('./app/routes/allergie.routes.js');
//var cityRoutes = require('./app/routes/city.routes.js');
//var clinicHistoryRoutes = require('./app/routes/clinichistory.routes.js');
//var countryRoutes = require('./app/routes/country.routes.js');
//var diseaseRoutes = require('./app/routes/disease.routes.js');
//var medicRoutes = require('./app/routes/medic.routes.js');
//var patientRoutes = require('./app/routes/patient.routes.js');
//var patientPhoneRoutes = require('./app/routes/patientphone.routes.js');
//var socialInsuranceRoutes = require('./app/routes/socialinsurance.routes.js');


app.use(express.static(__dirname + '/public'));
app.use('/isof', userRoutes);
//app.use('/isof', allergieRoutes);
//app.use('/isof', cityRoutes);
//app.use('/isof', clinicHistoryRoutes);
//app.use('/isof', countryRoutes);
//app.use('/isof', diseaseRoutes);
//app.use('/isof', medicRoutes);
//app.use('/isof', patientRoutes);
//app.use('/isof', patientPhoneRoutes);
//app.use('/isof', socialInsuranceRoutes);






// listen to port
app.listen(3000, function(){
	console.log('Listening on port 3000...');	
});
