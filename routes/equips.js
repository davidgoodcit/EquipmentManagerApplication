var express = require('express');
var router = express.Router();
var mongoose = require('mongoose'); //mongo connection
var bodyParser = require('body-parser'); //parses information from POST
var methodOverride = require('method-override');
var qr = require('qr-image'); 
var sendgrid = require('sendgrid')('DavidGoodCIT', 'charliesierra1'); 
     //used to manipulate POST
var Equip = require('../models/equips');

//status of equipment
var status = 'blank';
//todays date
var date = new Date();
//getting components of todays date
var month = date.getUTCMonth()+1; 
var day = date.getUTCDate()+14;//today plus 2 weeks
var year = date.getUTCFullYear();
//making a string of todays date
myDate= (year + '-' + month + '-' + day);

//Any requests to this controller must pass through this 'use' function
router.use(bodyParser.urlencoded({ extended: true }));

//dont allow user access if they are not authenticated
function ensureAuthenticated(req, res, next){
	if(req.isAuthenticated()){
		return next();
	} else {
		res.redirect('/users/login');
	}
}

//call authentication
router.all("/*", ensureAuthenticated, function(req, res, next) {
   next(); 
           
});

//for the index function, show all equips
router.get('/', function(req, res){

  Equip.find(function(err, equips) {
     res.render('equips/index',
     	{equips : equips});
  });
});

//get the details by id for individual equipment
router.get('/details/:id', function(req, res){
	var id = req.params.id;
	//create qr code to go here
	var code = qr.imageSync("http://www.equipManager.ie/equips/details/"+id, { type: 'svg' });
	
	//put all equips under this id into an array
  Equip.findById(id, function(err, equip) {
  	//compare todays date to inspection date, if closer than 2 weeks change status 
  	if(myDate>=equip.nextInspect){
  		status='red';
  	}
  	else{
  		status='blank';
  	}
  	//pass equips array, qr code and status to view
     res.render('equips/details',
     	{equip : equip,
     		code:code,
     	status:status});

  });
});

//go to the add page
router.get('/add', function(req, res){
  res.render('equips/add');
});

//go here after the add form is submitted
router.post('/add', function(req, res){
	
	var newEquip = new Equip ({
		name: req.body.name,
		department: req.body.department,
		prevInspect: req.body.prevInspect,
		nextInspect: req.body.nextInspect,
		currentLoc: req.body.currentLoc,
		img_url: req.body.img_url
		
	}).save(function (err){});

//go back to index
  res.redirect('/equips');
});

//go to the edit page for this equipment 
router.get('/edit/:id', function(req, res){
	var id = req.params.id;
  Equip.findById(id, function(err, equip) {
     res.render('equips/edit',
     	{equip : equip});

  });
});

//edit the equipment in the database
router.post('/edit/:id', function(req, res){
	var id = req.params.id;
	Equip.findById(id, function(err, equip){
		equip.name=req.body.name;
		equip.department=req.body.department;
		equip.prevInspect=req.body.prevInspect;
		equip.nextInspect=req.body.nextInspect;
		equip.currentLoc=req.body.currentLoc;
		equip.img_url=req.body.img_url;

		equip.save();
			//redirect to here
		 res.redirect('/equips');
	});
 
});

//delete this equipment
router.get('/delete/:id', function(req, res){
	var id = req.params.id;
	Equip.findById(id, function(err, equip){
		equip.name=req.body.name;
		equip.department=req.body.department;
		equip.prevInspect=req.body.prevInspect;
		equip.nextInspect=req.body.nextInspect;
		equip.currentLoc=req.body.currentLoc;
		equip.img_url=req.body.img_url;
		equip.remove();

		 res.redirect('/equips');
	});
 
});
//function to send an email
router.get('/sendEmail/:id', function(req, res){
  	var id = req.params.id;

  	sendgrid.send({
  		to: 	'david.good@mycit.ie',
  		from: 	'noreply@equipmanager.ie', 
  		subject: 'REMINDER',
  		text: 	'The Equipment with id ' + id + ' must be scheduled for inspection'
  	}, function(err,json){
  		if(err) {return res.send('FAILED') }
  		 res.redirect('/equips');
  	});
});

module.exports = router;