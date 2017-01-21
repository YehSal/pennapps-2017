var express = require('express');
var app = express();
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var port = process.env.PORT || 8080;
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');
var morgan = require('morgan');
var session = require('express-session');
var config = require('./config/database');
var User = require('./app/models/user');
var jwt = require('jwt-simple');
var NutritionixClient = require('nutritionix');
var NUTRITIONIX_APPID = process.env.NUTRITIONIX_APPID;
var NUTRITIONIX_APPKEY = process.env.NUTRITIONIX_APPKEY;
const request = require('request')
// configuration
//mongoose.connect(configDB.url);

// require('./config/passport')(passport);

app.use(morgan('dev'))


//var index = require('./routes/index');
//var users = require('./routes/users');
//var api = require('./routes/api')


// view engine setup
//app.set('views', path.join(__dirname, 'views'));
//app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
//app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
//app.use(express.static(path.join(__dirname, 'public')));

//app.use('/', index);
//app.use('/users', users);

//app.use(session({secret: 'hjbuiefkjaskjdsiun'}));
//app.use(passport.initialize());
//app.use(passport.session());
//app.use(flash());

app.use(passport.initialize());

app.get('/', function(req, res){
    res.send('API is at http:://localhost:' + port + '/api');
});

// var router = express.Router()

// router.get('/', function(req, res) {
//     res.json({ message: 'hooray! welcome to our api!' });   
// });

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   var err = new Error('Not Found');
//   err.status = 404;
//   next(err);
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

// app.use('/api', router);
app.listen(port);
console.log("Running on port " + port)

mongoose.connect(config.database, function(err){
    if(err){
        console.log(err);
    }
});

require('./config/passport')(passport);

var apiRoutes = express.Router();

apiRoutes.post('/signup', function(req, res){
    if (!req.body.name || !req.body.password){
        res.json({success: false, msg: "Please pass name and password."});
    }else{
        var newUser = new User({
            name: req.body.name,
            password: req.body.password,
            diseases: [],
        });

        newUser.save(function(err){
            if(err){
                return res.json({success: false, msg: 'Username already exists.'});
            }
            res.json({success: true, msg: "Successfully created new user."});
        });
    }
});

apiRoutes.post('/authenticate', function(req, res){

    User.findOne({
        name: req.body.name
    }, function(err, user){
        if(err) throw err;

        if(!user){
            res.send({success: false, msg: 'Authentication failed. User not found.'});
        }else{
            user.comparePassword(req.body.password, function(err, isMatch){
                if(isMatch && !err){
                    var token = jwt.encode(user, config.secret);

                    res.json({success: true, token: 'JWT ' + token});
                }else{
                    res.send({success: false, msg: 'Authentication failed. Wrong password.'});
                }
            });
        }
    });
});

apiRoutes.post('/nutrify', function(req, res){
    if(!req.body || !req.body.food){
        res.json({success: false, msg: "Must include food to lookup."});
    }else{
        console.log(req.body.food);
        request({
            url: "https://api.nutritionix.com/v1_1/search/" + req.body.food,
            qs: {
                //results: "0:20",
                //cal_min: "0",
                //cal_max: "50000",
                appId: NUTRITIONIX_APPID,
                appKey: NUTRITIONIX_APPKEY
            },
            method: "GET",
        }, function(error, response, body){
            var jsonBody = JSON.parse(response.body);
            if (error) {
                console.log('Error getting food descriptions: ', error);
                res.json({success: false, msg: "Error getting food descriptions: "+ error});
            } else if (response.body.error) {
                console.log('Error: ', response.body.error);
                res.json({success: false, msg: "Error getting food descriptions: "+ response.body.error});
            } else if(jsonBody.hits.length == 0) {
                res.json({success: false, msg: "Error getting food descriptions: No hits found."});
            }else{
                var firstHit = jsonBody.hits[0];
                //console.log(jsonBody);
                var hitId = firstHit._id;

                request({
                    url: "https://api.nutritionix.com/v1_1/item",
                    qs: {
                        id: hitId,
                        appId: NUTRITIONIX_APPID,
                        appKey: NUTRITIONIX_APPKEY
                    },
                    method: "GET",
                }, function(error_c, response_c, body_c){
                    response_c.body = JSON.parse(response_c.body);
                    if (error_c) {
                        console.log('Error getting food descriptions: ', error_c);
                        res.json({success: false, msg: "Error getting nutrition values: "+ error_c});
                    } else if (response_c.body.error) {
                        console.log('Error: ', response_c.body.error);
                        res.json({success: false, msg: "Error getting nutrition values: "+ response_c.body.error});
                    }else{
                        res.json({success: true, data: response_c.body});                        
                    }
                });
            }
        });

    }
});

apiRoutes.get('/profile', passport.authenticate('jwt', { session: false}), function(req, res) {
  var token = getToken(req.headers);
  console.log("here")
  if (token) {
    var decoded = jwt.decode(token, config.secret);
    User.findOne({
      name: decoded.name
    }, function(err, user) {
        if (err) throw err;
 
        if (!user) {
          return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
        } else {
          res.json({success: true, msg: 'Welcome to your profile, ' + user.name + '!'});
        }
    });
  } else {
    return res.status(403).send({success: false, msg: 'No token provided.'});
  }
});

apiRoutes.post('/updateData', passport.authenticate('jwt', { session: false}), function(req, res){
    var token = getToken(req.headers);
    console.log("here")
    if (token) {
        var decoded = jwt.decode(token, config.secret);
        User.findOne({
          name: decoded.name
        }, function(err, user) {
            if (err) throw err;
     
            if (!user) {
              return res.status(403).send({success: false, msg: 'Authentication failed. User not found.'});
            } else {
              var newUserObj = req.body;
              var updateObj = {};
              //if(newUserObj.name){
              //  updateObj.name = newUserObj.name;
              //}
              if(newUserObj.diseases){
                updateObj.diseases = JSON.parse(newUserObj.diseases).diseases;
                console.log(updateObj);
              }

              var conditions = {_id: user._id};

              if (updateObj.name || updateObj.diseases){
                User.update(conditions, updateObj, {multi: false}, function(err, numAffected){
                    if (err){
                        console.log("Error updating: " + err);
                    }else{
                        res.json({success: true, msg: 'Successfully updated ' + user.name + '!'});
                    }
                });
              }else{
                res.json({success: false, msg: 'No field to update.'});
              }
              
            }
        });
    } else {
        return res.status(403).send({success: false, msg: 'No token provided.'});
    }
});
 
getToken = function (headers) {
  if (headers && headers.authorization) {
    var parted = headers.authorization.split(' ');
    console.log("here")
    if (parted.length === 2) {
      return parted[1];
    } else {
      return null;
    }
  } else {
    return null;
  }
};

apiRoutes.post('/')

app.use('/api', apiRoutes);

module.exports = app;
