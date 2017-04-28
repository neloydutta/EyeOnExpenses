var mongoose = require('mongoose')
var express = require('express');
var router = express.Router();
var dbsetup = require('../dbsetup');
var db = dbsetup.db;
var store = mongoose.model('store', dbsetup.storeSchema);
var expense = mongoose.model('expense', dbsetup.expenseSchema);
var log = mongoose.model('log', dbsetup.logSchema); 

router.get('/store-add-balance', function(req, res){
    query = req.query; //Query string: username=&store=&amt=
    //console.log(query)
    if(query.store && query.amt && query.username){
        if(req.session.user == undefined || req.session.user != query.username){
            res.statusMessage = 'Oops!';
            res.status(400).json({'status': 'failure', 'message': 'invalid request'});
        }
        else{
            if(dbsetup.status){
                store.find({username: query.username}, function(err, store_res){
                    if(err){
                        console.log('DB Fetch error!');
                        console.log(err);
                        res.statusMessage = 'Oops!';
                        res.status(502).json({'status': 'failure', 'message': 'internal server error'});
                    }
                    else{
                        if(store_res.length == 1){
                            for(i=0; i<store_res[0].stores.length; i++){
                                if(store_res[0].stores[i].name == query.store){
                                    var store_obj = store_res[0].stores[i];
                                    store_obj.balance = parseInt(store_res[0].stores[i].balance) + parseInt(query.amt);
                                    store_res[0].stores.splice(i, 1);
                                    store_res[0].stores.push(store_obj);
                                    //store_res.visits.$inc();
                                    console.log(store_res[0].stores);
                                    store_res[0].save();
                                    break;
                                }
                            }
                            if(i == store_res[0].stores.length){
                                console.log('DB Fetch error! (Probable cause: Invalid store)');
                                res.statusMessage = 'Oops!';
                                res.status(400).json({'status': 'failure', 'message': 'invalid store'});
                            }
                            else{
                                log.find({username: query.username}, function(err, log_res){
                                    if(err){
                                        console.log('DB Fetch error!');
                                        console.log(err);
                                        res.statusMessage = 'Oops!';
                                        res.status(502).json({'status': 'failure', 'message': 'internal server error'});
                                    }
                                    else{
                                        if(log_res.length == 1){
                                            log_res[0].log.push({'store': query.store, 'type': 'credit', 'amount': query.amt, 'when': new Date(), 'reason': 'Store credit' });
                                            //log_res.visits.$inc();
                                            log_res[0].save();
                                            res.statusMessage = 'Yay!';
                                            res.status(200).json({'status': 'success'});
                                        }
                                        else{
                                            console.log('DB Fetch error! (Probable cause: Invalid username)');
                                            res.statusMessage = 'Oops!';
                                            res.status(400).json({'status': 'failure', 'message': 'invalid user'});
                                        }
                                    }
                                });
                            }
                        }
                        else{
                            console.log('DB Fetch error! (Probable cause: Invalid username)');
                            res.statusMessage = 'Oops!';
                            res.status(400).json({'status': 'failure', 'message': 'invalid user'});
                        }
                    }
                });
            }
            else{
                console.log('DB setup error!');
                res.statusMessage = 'Oops!';
                res.status(502).json({'status': 'failure', 'message': 'internal server error'});
            }
        }
    }
    else{
        console.log('Bad Request by user! (Probable cause: Insufficient Parameters)');
        res.statusMessage = 'Oops!';
        res.status(400).json({'status': 'failure', 'message': 'insufficient parameters'});
    }
});


router.get('/add-expense', function(req, res){
    query = req.query; //Query string: username=&store=&amt=
    //console.log(query)
    if(query.store && query.amt && query.reason && query.when && query.username){
        if(req.session.user == undefined || req.session.user != query.username){
            res.statusMessage = 'Oops!';
            res.status(400).json({'status': 'failure', 'message': 'invalid request'});
        }
        else{
            if(dbsetup.status){
                store.find({username: query.username}, function(err, store_res){
                    if(err){
                        console.log('DB Fetch error!');
                        console.log(err);
                        res.statusMessage = 'Oops!';
                        res.status(502).json({'status': 'failure', 'message': 'internal server error'});
                    }
                    else{
                        if(store_res.length == 1){
                            for(i=0; i<store_res[0].stores.length; i++){
                                if(store_res[0].stores[i].name == query.store){
                                    //store_list[i].balance += parseInt(query.amt);
                                    store_res[0].stores[i].balance -= parseInt(query.amt);
                                    if(store_res[0].stores[i].balance < 0){
                                        console.log('Bad Request! (Probable cause: Store balance less => -ve)');
                                        res.statusMessage = 'Oops!';
                                        res.status(400).json({'status': 'failure', 'message': 'insufficient store balance'});
                                    }
                                    else{
                                        //store_res.visits.$inc();
                                        store_res[0].save();
                                        expense.find({username: query.username}, function(err, eres){
                                            if(err){
                                                console.log('DB Fetch error!');
                                                console.log(err);
                                                res.statusMessage = 'Oops!';
                                                res.status(502).json({'status': 'failure', 'message': 'internal server error'});
                                            }
                                            else if(eres.length == 0){
                                                console.log('DB Fetch error! (Probable cause: Invalid username)');
                                                res.statusMessage = 'Oops!';
                                                res.status(400).json({'status': 'failure', 'message': 'invalid user'});
                                            }
                                            else{
                                                eres[0].expense_cur.push({'reason': query.reason, 'amount': query.amt, 'fromstore': query.store, 'when': new Date(query.when)});
                                                //eres.visits.$inc();
                                                eres[0].save();
                                                log.find({username: query.username}, function(err, log_res){
                                                    if(err){
                                                        console.log('DB Fetch error!');
                                                        console.log(err);
                                                        res.statusMessage = 'Oops!';
                                                        res.status(502).json({'status': 'failure', 'message': 'internal server error'});
                                                    }
                                                    else{
                                                        if(log_res.length > 0){
                                                            log_res[0].log.push({'store': query.store, 'type': 'debit', 'amount': query.amt, 'when': new Date(query.when), 'reason': query.reason });
                                                            //log_res.visits.$inc();
                                                            log_res[0].save();
                                                            res.statusMessage = 'Yay!';
                                                            res.status(200).json({'status': 'success'});
                                                        }
                                                        else{
                                                            console.log('DB Fetch error! (Probable cause: Invalid username)');
                                                            res.statusMessage = 'Oops!';
                                                            res.status(400).json({'status': 'failure', 'message': 'invalid user'});
                                                        }
                                                    }
                                                });
                                            }
                                        });
                                    }
                                    break;
                                }
                            }
                            if(i == store_res[0].stores.length){
                                console.log('DB Fetch error! (Probable cause: Invalid store)');
                                res.statusMessage = 'Oops!';
                                res.status(400).json({'status': 'failure', 'message': 'invalid store'});
                            }
                        }
                        else{
                            console.log('DB Fetch error! (Probable cause: Invalid username)');
                            res.statusMessage = 'Oops!';
                            res.status(400).json({'status': 'failure', 'message': 'invalid user'});
                        }
                    }
                });
            }
            else{
                console.log('DB setup error!');
                res.statusMessage = 'Oops!';
                //res.status(502).json({'status': 'failure', 'message': 'Internal server error'});
                res.status(200).json({'status': 'success'});
            }
        }
    }
    else{
        console.log('Bad Request by user! (probable cause: insufficient parameters)')
        res.statusMessage = 'Oops!';
        res.status(400).json({'status': 'failure', 'message': 'insufficient parameters'});
    }
});

router.get('/store-transfer-balance', function(req, res){
    query = req.query; //Query string: tostore-&fromstore=&amt=&username=
    if(query.tostore && query.fromstore && query.amt && query.username){
        if(req.session.user == undefined || req.session.user != query.username){
            res.statusMessage = 'Oops!';
            res.status(400).json({'status': 'failure', 'message': 'invalid request'});
        }
        else{
            if(dbsetup.status){
                store.find({username: query.username}, function(err, store_res){
                    if(err){
                        console.log('DB Fetch error!');
                        console.log(err);
                        res.statusMessage = 'Oops!';
                        res.status(502).json({'status': 'failure', 'message': 'internal server error'});
                    }
                    else{
                        if(store_res.length==1){
                            tostoreidx = -1
                            //console.log(store_res);
                            for(var i=0; i<store_res[0].stores.length; i++){
                                if(store_res[0].stores[i].name == query.fromstore){
                                    if(store_res[0].stores[i].balance >= query.amt){
                                        var fromstoreobj = store_res[0].stores[i];
                                        store_res[0].stores.splice(i, 1);
                                        fromstoreobj.balance -= query.amt;
                                        for(var j=0; j<store_res[0].stores.length; j++){
                                            if(store_res[0].stores[j].name == query.tostore){
                                                tostoreidx = j;
                                                break;
                                            }
                                        }
                                        var tostoreobj = store_res[0].stores[tostoreidx];
                                        tostoreobj.balance = parseInt(store_res[0].stores[tostoreidx].balance) + parseInt(query.amt);
                                        store_res[0].stores.splice(tostoreidx, 1);
                                        store_res[0].stores.push(tostoreobj);
                                        store_res[0].stores.push(fromstoreobj);
                                        console.log(store_res[0].stores);
                                        //store_res.visits.$inc();
                                        store_res[0].save();
                                        res.statusMessage = 'Yay!';
                                        res.status(200).json({'status': 'success'});
                                        log.find({username: query.username}, function(err, log_res){
                                            if(err){
                                                console.log('DB Fetch error!');
                                                console.log(err);
                                                //res.statusMessage = 'Oops!';
                                                //res.status(502).json({'status': 'failure', 'message': 'internal server error'});
                                            }
                                            else{
                                                if(log_res.length > 0){
                                                    log_res[0].log.push({'store': query.fromstore, 'type': 'debit', 'amount': query.amt, 'when': new Date(), 'reason': 'store credit transfer to '+query.tostore });
                                                    log_res[0].log.push({'store': query.tostore, 'type': 'credit', 'amount': query.amt, 'when': new Date(), 'reason': 'store credit transfer from '+query.fromstore });
                                                    //log_res.visits.$inc();
                                                    log_res[0].save();
                                                }
                                                else{
                                                    console.log('DB Fetch error! (Probable cause: Invalid username)');
                                                    //res.statusMessage = 'Oops!';
                                                    //res.status(400).json({'status': 'failure', 'message': 'invalid user'});
                                                }
                                            }
                                        });
                                        break;   
                                    }
                                    else{
                                        console.log('Bad request by user! (Probable cause: Insufficient balance)');
                                        res.statusMessage = 'Oops!';
                                        res.status(400).json({'status': 'failure', 'message': 'insufficient balance'});
                                    }
                                }
                            }
                        }
                        else{
                            console.log('DB Fetch error! (Probable cause: Invalid username)');
                            res.statusMessage = 'Oops!';
                            res.status(400).json({'status': 'failure', 'message': 'invalid user'});
                        }
                    }
                });
            }
            else{
                console.log('DB setup error!');
                res.statusMessage = 'Oops!';
                res.status(502).json({'status': 'failure', 'message': 'internal server error'});
            }
        }
    }
    else{
        console.log('Bad request by user! (probable cause: insufficient parameters)');
        res.statusMessage = 'Oops!';
        res.status(400).json({'status': 'failure', 'message': 'insufficient parameters'});
    }
});

router.get('/add-store', function(req, res){
    query = req.query;
    if(query.username && query.store && query.balance){
        if(req.session.user == undefined || req.session.user != query.username){
            res.statusMessage = 'Oops!';
            res.status(400).json({'status': 'failure', 'message': 'invalid request'});
        }
        else{
            if(dbsetup.status){
                store.find({username: query.username}, function(err, store_res){
                    if(err){
                        console.log('DB Fetch error!');
                        console.log(err);
                        res.statusMessage = 'Oops!';
                        res.status(502).json({'status': 'failure', 'message': 'internal server error'});
                    }
                    else{
                        if(store_res.length>0){
                            is_available_flag = false;
                            for(i=0; i<store_res[0].stores.length; i++){
                                if(store_res[0].stores[i].name == query.store){
                                    is_available_flag = true;
                                    break;
                                }
                            }
                            if(!is_available_flag){
                                store_res[0].stores.push({'name': query.store, 'balance': query.balance});
                                //store_res.visits.$inc();
                                store_res[0].save();
                                console.log('store: '+query.store+', added for user: '+query.username+' !');
                                res.statusMessage = 'Yay!';
                                res.status(200).json({'status': 'success'});
                            }
                            else{
                                console.log('Bad request by user! (Probable cause: store already present)');
                                res.statusMessage = 'Oops!';
                                res.status(400).json({'status': 'failure', 'message': 'store available'});
                            }
                        }
                        else{
                            console.log('DB Fetch error! (Probable cause: Invalid username)');
                            res.statusMessage = 'Oops!';
                            res.status(502).json({'status': 'failure', 'message': 'invalid user'});
                        }
                    }
                });
            }
            else{
                console.log('DB setup error!');
                res.statusMessage = 'Oops!';
                res.status(502).json({'status': 'failure', 'message': 'internal server error'});
            }
        }
    }
    else{
        console.log('Bad request by user! (probable cause: insufficient parameters)');
        res.statusMessage = 'Oops!';
        res.status(400).json({'status': 'failure', 'message': 'insufficient parameters'});
    }
});

router.get('/remove-store', function(req, res){
    query = req.query;
    if(query.username && query.store){
        if(req.session.user == undefined || req.session.user != query.username){
            res.statusMessage = 'Oops!';
            res.status(400).json({'status': 'failure', 'message': 'invalid request'});
        }
        else{
            if(dbsetup.status){
                store.find({username: query.username}, function(err, store_res){
                    if(err){
                        console.log('DB Fetch error!');
                        console.log(err);
                        res.statusMessage = 'Oops!';
                        res.status(502).json({'status': 'failure', 'message': 'internal server error'});
                    }
                    else{
                        if(store_res.length>0){
                            is_available_flag = false;
                            for(i=0; i<store_res[0].stores.length; i++){
                                if(store_res[0].stores[i].name == query.store){
                                    is_available_flag = true;
                                    store_res[0].stores.splice(i, 1);
                                    //store_res.visits.$inc();
                                    store_res[0].save();
                                    console.log('store: '+query.store+', removed for user: '+query.username+' !');
                                    res.statusMessage = 'Yay!';
                                    res.status(200).json({'status': 'success'});
                                    break;
                                }
                            }
                            if(!is_available_flag){
                                console.log('Bad request by user! (Probable cause: store not present)');
                                res.statusMessage = 'Oops!';
                                res.status(400).json({'status': 'failure', 'message': 'store not-available'});
                            }
                        }
                        else{
                            console.log('DB Fetch error! (Probable cause: Invalid username)');
                            res.statusMessage = 'Oops!';
                            res.status(400).json({'status': 'failure', 'message': 'invalid user'});
                        }
                    }
                });
            }
            else{
                console.log('DB setup error!');
                res.statusMessage = 'Oops!';
                res.status(502).json({'status': 'failure', 'message': 'internal server error'});
            }
        }
    }
    else{
        console.log('Bad request by user! (probable cause: insufficient parameters)');
        res.statusMessage = 'Oops!';
        res.status(400).json({'status': 'failure', 'message': 'insufficient parameters'});
    }
});


router.get('/stores-list', function(req, res){
    query = req.query;
    //console.log(req.session.user);
    if(query.username){
        if(req.session.user == undefined || req.session.user != query.username){
            res.statusMessage = 'Oops!';
            res.status(400).json({'status': 'failure', 'message': 'invalid request'});
        }
        else{
            if(dbsetup.status){
                //console.log(dbsetup);
                store.find({username: query.username}, function(err, store_res){
                    if(err){
                        console.log('DB Fetch error!');
                        console.log(err);
                        res.statusMessage = 'Oops!';
                        res.status(502).json({'status': 'failure', 'message': 'internal server error'});
                    }
                    else{
                        if(store_res.length>0){
                            res.statusMessage = "Yay!";
                            res.status(200).json(store_res[0]);
                        }
                        else{
                            console.log('DB Fetch error! (Probable cause: Invalid username)');
                            res.statusMessage = 'Oops!';
                            res.status(400).json({'status': 'failure', 'message': 'invalid user'});
                        }
                    }
                });
            }
            else{
                console.log('DB setup error!');
                //console.log(dbsetup.status);
                res.statusMessage = 'Oops!';
                res.status(502).json({'status': 'failure', 'message': 'internal server error'});
                //res.json({'username': 'Ironman', 'stores': [{'name': 'wallet', 'balance': 200}, {'name': 'Iron Bank of Braavos', 'balance': 2000}, {'name': 'Gringotts Wizarding Bank', 'balance': 3000}]})
            }
        }
    }
    else{
        console.log('Bad request by user! (probable cause: insufficient parameters)');
        res.statusMessage = 'Oops!';
        res.status(400).json({'status': 'failure', 'message': 'insufficient parameters'});
    }
});

router.get('/expenses-list', function(req, res){
    query = req.query;
    if(query.username){
        if(req.session.user == undefined || req.session.user != query.username){
            res.statusMessage = 'Oops!';
            res.status(400).json({'status': 'failure', 'message': 'invalid request'});
        }
        else{
            if(dbsetup.status){
                //console.log(dbsetup);
                expense.find({username: query.username}, function(err, store_res){
                    if(err){
                        console.log('DB Fetch error!');
                        console.log(err);
                        res.statusMessage = 'Oops!';
                        res.status(502).json({'status': 'failure', 'message': 'internal server error'});
                    }
                    else{
                        if(store_res.length>0){
                            res.statusMessage = "Yay!";
                            res.status(200).json(store_res[0]);
                        }
                        else{
                            console.log('DB Fetch error! (Probable cause: Invalid username)');
                            res.statusMessage = 'Oops!';
                            res.status(400).json({'status': 'failure', 'message': 'invalid user'});
                        }
                    }
                });
            }
            else{
                console.log('DB setup error!');
                res.statusMessage = 'Oops!';
                //res.status(502).json({'status': 'failure', 'message': 'internal server error'});
                res.json({'username': 'Ironman', 'recent': [{'reason': 'for no reason', 'amount': 200, 'when': new Date(), 'fromstore': 'wallet'}, {'reason': 'for some reason', 'amount': 200, 'when': new Date(), 'fromstore': 'wallet'}], 'history': [{'reason': 'for no reason', 'amount': 200, 'when': new Date(), 'fromstore': 'wallet'}, {'reason': 'for some reason', 'amount': 200, 'when': new Date(), 'fromstore': 'wallet'}]})
            }
        }
    }
    else{
        console.log('Bad request by user! (probable cause: insufficient parameters)');
        res.statusMessage = 'Oops!';
        res.status(400).json({'status': 'failure', 'message': 'insufficient parameters'});
    }
});

router.get('/reset-recent', function(req, res){
    query = req.query;
    if(query.username){
        if(req.session.user == undefined || req.session.user != query.username){
            res.statusMessage = 'Oops!';
            res.status(400).json({'status': 'failure', 'message': 'invalid request'});
        }
        else{
            if(dbsetup.status){
                //console.log(dbsetup);
                expense.find({username: query.username}, function(err, exp_res){
                    if(err){
                        console.log('DB Fetch error!');
                        console.log(err);
                        res.statusMessage = 'Oops!';
                        res.status(502).json({'status': 'failure', 'message': 'internal server error'});
                    }
                    else{
                        if(exp_res.length == 1){
                            for(var i=0; i<exp_res[0].expense_cur.length; i++)
                                exp_res[0].expense_history.push(exp_res[0].expense_cur[i]);
                            exp_res[0].expense_cur = [];
                            // console.log(exp_res[0].expense_cur);
                            // console.log(exp_res[0].expense_history);
                            // exp_res.visits.$inc();
                            exp_res[0].save();
                            res.statusMessage = "Yay!";
                            res.status(200).json({'status': 'success'});
                        }
                        else{
                            console.log('DB Fetch error! (Probable cause: Invalid username)');
                            res.statusMessage = 'Oops!';
                            res.status(400).json({'status': 'failure', 'message': 'invalid user'});
                        }
                    }
                });
            }
            else{
                console.log('DB setup error!');
                res.statusMessage = 'Oops!';
                //res.status(502).json({'status': 'failure', 'message': 'internal server error'});
                res.json({'status': 'success'});
            }
        }
    }
    else{
        console.log('Bad request by user! (probable cause: insufficient parameters)');
        res.statusMessage = 'Oops!';
        res.status(400).json({'status': 'failure', 'message': 'insufficient parameters'});
    }
});

router.get('/statement', function(req, res, next){
    query = req.query;
    if(query.username){
        if(req.session.user == undefined || req.session.user != query.username){
            res.statusMessage = 'Oops!';
            res.status(400).json({'status': 'failure', 'message': 'invalid request'});
        }
        else{
            if(dbsetup.status){
                log.find({username: query.username}, function(err, log_res){
                    if(err){
                        console.log('DB Fetch error!');
                        console.log(err);
                        res.statusMessage = 'Oops!';
                        res.status(502).json({'status': 'failure', 'message': 'internal server error'});
                    }
                    else{
                        if(log_res.length > 0){
                            res.statusMessage = 'Yay!';
                            res.status(200).json({'status': 'success', 'log': log_res});
                        }
                        else{
                            console.log('DB Fetch error! (Probable cause: Invalid username)');
                            res.statusMessage = 'Oops!';
                            res.status(400).json({'status': 'failure', 'message': 'invalid user'});
                        }
                    }
                });
            }
            else{
                console.log('DB Setup error!');
                res.statusMessage = 'Oops!';
                res.status(502).json({'status': 'failure', 'message': 'internal server error'});
            }
        }
    }
    else{
        console.log('Bad request by user! (probable cause: insufficient parameters)');
        res.statusMessage = 'Oops!';
        res.status(400).json({'status': 'failure', 'message': 'insufficient parameters'});
    }
});

router.get('/*', function(req, res, next) {
  res.status(400).send({'message': 'Hello from Batman!'});
});

module.exports = router;