var mongoose = require('mongoose')
var express = require('express');
var router = express.Router();
var dbsetup = require('../dbsetup');
var db = dbsetup.db;
var user = mongoose.model('user', dbsetup.userSchema);

router.get('/useravailcheck', function(req, res){
    query = req.query;
    if(query.username){
        if(dbsetup.status){
            user.find({username: query.username}, function(err, user_res){
                if(err){
                    console.log('DB Fetch error!');
                    console.log(err);
                    res.statusMessage = 'Oops!';
                    res.status(500).json({'status': 'failure', 'message': 'internal server error'});
                }
                else{
                    if(user_res.length == 0){
                        res.status(200).json({'status': 'success', 'availability': true});
                    }
                    else{
                        res.status(200).json({'status': 'success', 'availability': false});
                    }
                }
            });
        }
        else{
            console.log('DB Setup error!');
            res.statusMessage = 'Oops!';
            res.status(500).json({'status': 'failure', 'message': 'internal server error'});
        }
    }
    else{
        console.log('Bad request by user! (probable cause: insufficient parameters)');
        res.statusMessage = 'Oops!';
        res.status(400).json({'status': 'failure', 'message': 'insufficient parameters'});
    }
});

router.post('/login', function(req, res){
    if(req.body.username && req.body.password){
        if(dbsetup.status){
            user.find({'username': req.body.username}, function(err, user_res){
                if(err){
                    console.log('DB Fetch error!');
                    console.log(err);
                    res.statusMessage = 'Oops!';
                    res.status(500).json({'status': 'failure', 'message': 'internal server error'});
                }
                else if(user_res.length == 1){
                    if(req.body.password == user_res[0].password){
                        req.session.user = req.body.username;
                        res.statusMessage = 'Yay!';
                        res.status(200).json({'status': 'success'});
                    }
                    else{
                        res.statusMessage = 'Oops!';                   
                        res.status(400).json({'status': 'failure'});
                    }
                }
                else{
                    res.statusMessage = 'Oops!';
                    res.status(400).json({'status': 'failure'});
                }
            });
        }
        else{
            console.log('DB Setup error!');
            res.statusMessage = 'Oops!';
            res.status(500).json({'status': 'failure', 'message': 'internal server error'});
        }
    }
    else{
        console.log('Bad request by user! (probable cause: insufficient parameters)');
        res.statusMessage = 'Oops!';
        res.status(400).json({'status': 'failure', 'message': 'insufficient parameters'});
    }
});

router.post('/signup', function(req, res){
    if(req.body.username && req.body.password){
        if(dbsetup.status){
           var user = new user({
                username: req.body.username,
                password: req.body.password
           });
           user.save(function(err, user){
                if(err){
                    console.log(err);
                    res.statusMessage = 'Oops!';
                    res.status(500).json({'status': 'failure', 'message': 'internal server error'});
                }
                else{
                    console.log("User registered: "+user.username);
                    res.statusMessage = 'Yay!';
                    res.status(200).json({'status': 'success'});
                }
           });
        }
        else{
            console.log('DB Setup error!');
            res.statusMessage = 'Oops!';
            res.status(500).json({'status': 'failure', 'message': 'internal server error'});
        }
    }
    else{
        console.log('Bad request by user! (probable cause: insufficient parameters)');
        res.statusMessage = 'Oops!';
        res.status(400).json({'status': 'failure', 'message': 'insufficient parameters'});
    }
});

router.post('/logout', function(req, res){
    req.session.destroy(function(err){
        if(err){
            console.log('Error in logout!');
            console.log(err);
            res.statusMessage = 'Oops!';
            res.status(200).json({'status': 'failure'});   
        }
        else{
            console.log("User Logged-out: "+user.username);
            res.statusMessage = 'Yay!';
            res.status(200).json({'status': 'success'});
        }
    });
});


module.exports = router;