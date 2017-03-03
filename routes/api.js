var mongoose = require('mongoose')
var express = require('express');
var router = express.Router();
var dbsetup = require('../dbsetup');
var db = dbsetup.db;
var store = mongoose.model('store', dbsetup.storeSchema);
var expense = mongoose.model('expense', dbsetup.expenseSchema);


router.get('/store-add-balance', function(req, res){
    query = req.query;
    //console.log(query)
    if(query.store && query.amt && query.username){
        if(dbsetup.status){
            store.find({username: query.username}, function(err, store_res){
                if(err){
                    console.log('DB Fetch error!');
                    console.log(err);
                    res.statusMessage = 'Oops!';
                    res.status(400).json({'status': 'failure'});
                }
                else{
                    if(length(store_res) > 0){
                        for(i=0; i<length(store_res.stores); i++){
                            if(store_res.stores[i].name == query.store){
                                //store_list[i].balance += parseInt(query.amt);
                                store_res.stores[i].balance += parseInt(query.amt);
                                store_res.visits.$inc();
                                store_res.save()
                                break;
                            }
                        }
                        if(i == length(store_list)){
                            console.log('DB Fetch error! (Probable cause: Invalid store)');
                            res.statusMessage = 'Oops!';
                            res.status(400).json({'status': 'failure'});
                        }
                        else{
                            res.statusMessage = 'success!';
                            res.status(200).json({'status': 'success'});
                        }
                    }
                    else{
                        console.log('DB Fetch error! (Probable cause: Invalid username)');
                        res.statusMessage = 'Oops!';
                        res.status(400).json({'status': 'failure'});
                    }
                }
            });
        }
        else{
            console.log('DB setup error!');
            res.statusMessage = 'Oops!';
            res.status(500).json({'status': 'failure'});
        }
    }
    else{
        console.log('Bad Request by user!')
        res.statusMessage = 'Oops!';
        res.status(400).json({'status': 'failure'});
    }
});

router.get('/store-subtract-balance', function(req, res){
    query = req.query;
    //console.log(query)
    if(query.store && query.amt && query.username){
        if(dbsetup.status){
            store.find({username: query.username}, function(err, store_res){
                if(err){
                    console.log('DB Fetch error!');
                    console.log(err);
                    res.statusMessage = 'Oops!';
                    res.status(400).json({'status': 'failure'});
                }
                else{
                    if(length(store_res) > 0){
                        for(i=0; i<length(store_res.stores); i++){
                            if(store_res.stores[i].name == query.store){
                                //store_list[i].balance += parseInt(query.amt);
                                store_res.stores[i].balance -= parseInt(query.amt);
                                if(store_res.stores[i].balance < 0){
                                    console.log('Bad Request! (Probable cause: Store balance less => -ve)');
                                    res.statusMessage = 'Oops!';
                                    res.status(400).json({'status': 'failure'});
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
                            res.status(400).json({'status': 'failure'});
                        }
                    }
                    else{
                        console.log('DB Fetch error! (Probable cause: Invalid username)');
                        res.statusMessage = 'Oops!';
                        res.status(400).json({'status': 'failure'});
                    }
                }
            });
        }
        else{
            console.log('DB setup error!');
            res.statusMessage = 'Oops!';
            res.status(500).json({'status': 'failure'});
        }
    }
    else{
        console.log('Bad Request by user! (probable cause: insufficient parameters)')
        res.statusMessage = 'Oops!';
        res.status(400).json({'status': 'failure'});
    }
});

router.get('/store-transfer-balance', function(req, res){
    query = req.query;
    if(query.tostore && query.fromstore && query.amt && query.username){

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