var express = require('express');
var router = express.Router();
var path = require('path');
var passport = require('passport');
var User = require('../app/models/user');
var Disease = require('../app/models/disease');
var jwt = require('jwt-simple');
var config = require('../config/database');
var request = require('request');
var async = require('async');
const NUTRITIONIX_APPID = process.env.NUTRITIONIX_APPID;
const NUTRITIONIX_APPKEY = process.env.NUTRITIONIX_APPKEY;
const nutritionMap = {
  "fat": "nf_total_fat",
  "sodium": "nf_sodium",
  "cholesterol": "nf_cholesterol",
  "carbohydrate": "nf_total_carbohydrate",
  "sugars": "nf_sugars",
  "protein": "nf_protein",
  "calories": "nf_calories",
};

require('../config/passport')(passport);

router.get('/check', (req, res) => {
  res.json({ boi: 'boi' });
})

router.post('/signup', function(req, res){
  if (!req.body.name || !req.body.password){
      res.json({success: false, msg: "Please pass name and password."});
  } else {
    var newUser = new User({
        name: req.body.name,
        password: req.body.password,
        diseases: [],
    });

    newUser.save(function(err){
        if(err){
            return res.json({success: false, msg: 'Username already exists.'});
        }
        User.findOne({
          name: req.body.name
        }, (err, user) => {
          if (err) throw err;
          if (!user) {
            res.send({success: false, msg: 'Authentication failed. User not found'});
          } else {
            var token = jwt.encode(user, config.secret);
            console.log(token);
            res.json({success: true, token: 'JWT ' + token});
          }
        });
    });
    }
});

router.post('/authenticate', function(req, res){
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
                  console.log(token);
                  res.json({success: true, token: 'JWT '+ token});
              }else{
                  res.send({success: false, msg: 'Authentication failed. Wrong password.'});
              }
          });
        }
    });
});

var nutritionInfo = [];

function getThresholds(diseaseName, cb){
  Disease.findOne({
    name: diseaseName,
  }, function(err, disease){
    if(err){
      console.log("Disease not found.");
    }else{
      console.log(disease);
      nutritionInfo.push(disease);
      cb();
    }
  });
}

router.post('/analyze', passport.authenticate('jwt', { session: false}), function(req, res){

  if(!req.body || !req.body.food){
    res.json({success: false, msg: "Must include food name."});
  }else{
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
            var username = user.name;
            //res.json({success: true, msg: 'Welcome to your profile, ' + user.name + '!'});
            
                if(user.diseases.length == 0){
                  res.json({success: true, data: {analyses: [] }});
                }else{

                  var asyncTasks = [];
                  nutritionInfo = [];

                  // load thresholds for the disease
                  user.diseases.forEach(function(disease){
                    asyncTasks.push(function(cb){
                      getThresholds(disease, function(){
                        cb();
                      });
                    });
                  });

                  async.parallel(asyncTasks, function(){

                    // get nutrition data now
                    console.log(nutritionInfo);
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
                                    //res.json({success: true, data: response_c.body});
                                    var foodInfo = response_c.body;
                                    console.log(foodInfo);
                                    var conflicts = {};
                                    nutritionInfo.forEach(function(disease){
                                      disease.nutrients_to_avoid.forEach(function(nutrient){
                                        var mappedNutrientName = nutritionMap[nutrient.name];
                                        var lvl = 100000;
                                        if (mappedNutrientName in foodInfo){
                                          lvl = foodInfo[mappedNutrientName];
                                        }
                                        if (lvl == null){
                                          lvl = 100000;
                                        }

                                        if(lvl >= nutrient.threshold){
                                          if (!(nutrient.name in conflicts)){
                                            var nutriDiseases = [];
                                            conflicts[nutrient.name] = nutriDiseases;

                                          }
                                          conflicts[nutrient.name].push({
                                            name: disease.name,
                                            threshold: nutrient.threshold,
                                            realval: lvl,
                                            percentage: (lvl / nutrient.threshold) * 100,
                                          });

                                        }
                                      });
                                    });
                                    res.json({success: true, data: {analyses: conflicts}});

                                }
                            });
                        }
                    });


                  });


                }
              
          }
      });
    } else {
      return res.status(403).send({success: false, msg: 'No token provided.'});
    }
  }
})

router.post('/foodsearch', (req, res) => {
  if (!req.body || !req.body.term) {
    res.json({ success: false, msg: "must include food to lookup"});
  } else {
    request({
      url: "https://api.nutritionix.com/v1_1/search/" + req.body.term,
      qs: {
          //results: "0:20",
          //cal_min: "0",
          //cal_max: "50000",
          appId: process.env.NUTRITIONIX_APPID,
          appKey: process.env.NUTRITIONIX_APPKEY
      },
      method: "GET"
    }, (error, response, body) => {
      console.log('here')
      if (error) {
        console.log('Error getting food descriptions: ', error);
        res.json({success: false, msg: "Error getting food descriptions: "+ error});
      } else if (response.body.error) {
          console.log('Error: ', response.body.error);
          res.json({success: false, msg: "Error getting food descriptions: "+ response.body.error});
      } else {
        var jsonBody = JSON.parse(response.body);
        results = []
        for (item of jsonBody.hits) {
          results.push(item.fields)
        }
        res.json({ success: false, results: results });
      }
    })
  }
})

router.post('/nutritionsearch', (req, res) => {
  var nutritionixId = req.body.nutritionixId;
  console.log(nutritionixId)
  request({
      url: "https://api.nutritionix.com/v1_1/item",
      qs: {
          id: nutritionixId,
          appId: process.env.NUTRITIONIX_APPID,
          appKey: process.env.NUTRITIONIX_APPKEY
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
          res.json({success: true, results: response_c.body});
      }
  });
})

router.post('/nutrify', function(req, res){
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
                appId: process.env.NUTRITIONIX_APPID,
                appKey: process.env.NUTRITIONIX_APPKEY
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
                        appId: process.env.NUTRITIONIX_APPID,
                        appKey: process.env.NUTRITIONIX_APPKEY
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

router.get('/profile', passport.authenticate('jwt', { session: false}), function(req, res) {
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

router.post('/updateData', passport.authenticate('jwt', { session: false}), function(req, res){
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
    //return headers.authorization
  } else {
    return null;
  }
};

module.exports = router;
