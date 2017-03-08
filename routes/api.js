var mongoose = require('mongoose')
var express = require('express');
var router = express.Router();
var dbsetup = require('../dbsetup');
var db = dbsetup.db;
var store = mongoose.model('store', dbsetup.storeSchema);
var expense = mongoose.model('expense', dbsetup.expenseSchema);


router.get('/store-add-balance', function(req, res){
    query = req.query; //Query string: username=&store=&amt=
    //console.log(query)
    if(query.store && query.amt && query.username){
        if(dbsetup.status){
            store.find({username: query.username}, function(err, store_res){
                if(err){
                    console.log('DB Fetch error!');
                    console.log(err);
                    res.statusMessage = 'Oops!';
                    res.status(500).json({'status': 'failure', 'message': 'internal server error'});
                }
                else{
                    if(length(store_res) > 0){
                        for(i=0; i<length(store_res[0].stores); i++){
                            if(store_res[0].stores[i].name == query.store){
                                //store_list[i].balance += parseInt(query.amt);
                                store_res[0].stores[i].balance += parseInt(query.amt);
                                store_res.visits.$inc();
                                store_res.save()
                                break;
                            }
                        }
                        if(i == length(store_list)){
                            console.log('DB Fetch error! (Probable cause: Invalid store)');
                            res.statusMessage = 'Oops!';
                            res.status(400).json({'status': 'failure', 'message': 'invalid store'});
                        }
                        else{
                            res.statusMessage = 'success!';
                            res.status(200).json({'status': 'success'});
                        }
                    }
                    else{
                        console.log('DB Fetch error! (Probable cause: Invalid username)');
                        res.statusMessage = 'Oops!';
                        res.status(400).json({'status': 'failure', 'message': 'invalid username'});
                    }
                }
            });
        }
        else{
            console.log('DB setup error!');
            res.statusMessage = 'Oops!';
            res.status(500).json({'status': 'failure', 'message': 'internal server error'});
        }
    }
    else{
        console.log('Bad Request by user! (Probable cause: Insufficient Parameters)');
        res.statusMessage = 'Oops!';
        res.status(400).json({'status': 'failure', 'message': 'insufficient parameters'});
    }
});

router.get('/store-subtract-balance', function(req, res){
    query = req.query; //Query string: username=&store=&amt=
    //console.log(query)
    if(query.store && query.amt && query.username){
        if(dbsetup.status){
            store.find({username: query.username}, function(err, store_res){
                if(err){
                    console.log('DB Fetch error!');
                    console.log(err);
                    res.statusMessage = 'Oops!';
                    res.status(500).json({'status': 'failure', 'message': 'internal server error'});
                }
                else{
                    if(length(store_res) > 0){
                        for(i=0; i<length(store_res.stores); i++){
                            if(store_res[0].stores[i].name == query.store){
                                //store_list[i].balance += parseInt(query.amt);
                                store_res[0].stores[i].balance -= parseInt(query.amt);
                                if(store_res.stores[i].balance < 0){
                                    console.log('Bad Request! (Probable cause: Store balance less => -ve)');
                                    res.statusMessage = 'Oops!';
                                    res.status(400).json({'status': 'failure', 'message': 'insufficient store balance'});
                                }
                                else{
                                    store_res.visits.$inc();
                                    store_res.save();
                                    res.statusMessage = 'success!';
                                    res.status(200).json({'status': 'success'});
                                    break;
                                }
                            }
                        }
                        if(i == length(store_list)){
                            console.log('DB Fetch error! (Probable cause: Invalid store)');
                            res.statusMessage = 'Oops!';
                            res.status(400).json({'status': 'failure', 'message': 'invalid store'});
                        }
                    }
                    else{
                        console.log('DB Fetch error! (Probable cause: Invalid username)');
                        res.statusMessage = 'Oops!';
                        res.status(400).json({'status': 'failure', 'message': 'invalid username'});
                    }
                }
            });
        }
        else{
            console.log('DB setup error!');
            res.statusMessage = 'Oops!';
            res.status(500).json({'status': 'failure', 'message': 'Internal server error'});
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
        if(dbsetup.status){
            store.find({username: query.username}, function(err, store_res){
                tostoreidx = -1
                for(i=0; i<length(store_res.stores); i++){
                    if(store_res[0].store[i].name == query.tostore){
                        tostoreidx = i;
                        continue;
                    }
                    else if(store_res[0].stores[i].name == query.fromstore){
                        if(store_res[0].stores[i].balance >= query.amt){
                            store_res[0].store[i].balance -= query.amt
                            if(tostoreidx == -1){
                                for(j=0; j<length(store_res.stores); j++){
                                    if(store_res[0].stores[j].name == query.tostore){
                                        tostoreidx = j;
                                        break;
                                    }
                                }
                            }
                            store_res[0].stores[tostoreidx].balance += query.amt;
                            store_res.visits.$inc();
                            store_res.save();
                        }
                        else{
                            console.log('Bad request by user! (Probable cause: Insufficient balance)');
                            res.statusMessage = 'Oops!';
                            res.status(400).json({'status': 'failure', 'message': 'insufficient balance'});
                        }
                    }
                }
            });
        }
        else{
            console.log('DB setup error!');
            res.statusMessage = 'Oops!';
            res.status(500).json({'status': 'failure', 'message': 'internal server error'});
        }
    }
    else{
        console.log('Bad request by user! (probable cause: insufficient parameters)');
        res.statusMessage = 'Oops!';
        res.status(400).json({'status': 'failure'});
    }
});

router.get('/*', function(req, res, next) {
  res.send({'message': 'Hello from Batman!'});
});

module.exports = router;