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
                    if(store_res.length > 0){
                        for(i=0; i<store_res[0].stores.length; i++){
                            if(store_res[0].stores[i].name == query.store){
                                //store_list[i].balance += parseInt(query.amt);
                                store_res[0].stores[i].balance += parseInt(query.amt);
                                store_res.visits.$inc();
                                store_res.save()
                                break;
                            }
                        }
                        if(i == store_list.length){
                            console.log('DB Fetch error! (Probable cause: Invalid store)');
                            res.statusMessage = 'Oops!';
                            res.status(400).json({'status': 'failure', 'message': 'invalid store'});
                        }
                        else{
                            res.statusMessage = 'Yay!';
                            res.status(200).json({'status': 'success'});
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
            res.status(500).json({'status': 'failure', 'message': 'internal server error'});
        }
    }
    else{
        console.log('Bad Request by user! (Probable cause: Insufficient Parameters)');
        res.statusMessage = 'Oops!';
        res.status(400).json({'status': 'failure', 'message': 'insufficient parameters'});
    }
});

//To be updated to expenses
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
                                    res.statusMessage = 'Yay!';
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
                        res.status(400).json({'status': 'failure', 'message': 'invalid user'});
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
                if(err){
                    console.log('DB Fetch error!');
                    console.log(err);
                    res.statusMessage = 'Oops!';
                    res.status(500).json({'status': 'failure', 'message': 'internal server error'});
                }
                else{
                    if(length(store_res)>0){
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
                                    res.statusMessage = 'Yay!';
                                    res.status(200).json({'status': 'success'});
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
            res.status(500).json({'status': 'failure', 'message': 'internal server error'});
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
        if(dbsetup.status){
            store.find({username: query.username}, function(err, store_res){
                if(err){
                    console.log('DB Fetch error!');
                    console.log(err);
                    res.statusMessage = 'Oops!';
                    res.status(500).json({'status': 'failure', 'message': 'internal server error'});
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
                            store_res.visits.$inc();
                            store_res.save();
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
                        res.status(400).json({'status': 'failure', 'message': 'invalid user'});
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
        res.status(400).json({'status': 'failure', 'message': 'insufficient parameters'});
    }
});

router.get('/remove-store', function(req, res){
    query = req.query;
    if(query.username && query.store){
        if(dbsetup.status){
            store.find({username: query.username}, function(err, store_res){
                if(err){
                    console.log('DB Fetch error!');
                    console.log(err);
                    res.statusMessage = 'Oops!';
                    res.status(500).json({'status': 'failure', 'message': 'internal server error'});
                }
                else{
                    if(store_res.length>0){
                        is_available_flag = false;
                        for(i=0; i<store_res[0].stores.length; i++){
                            if(store_res[0].stores[i].name == query.store){
                                is_available_flag = true;
                                store_res[0].stores.splice(i, 1);
                                store_res.visits.$inc();
                                store_res.save();
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
            res.status(500).json({'status': 'failure', 'message': 'internal server error'});
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
    if(query.username){
        if(dbsetup.status){
            console.log(dbsetup);
            store.find({username: query.username}, function(err, store_res){
                if(err){
                    console.log('DB Fetch error!');
                    console.log(err);
                    res.statusMessage = 'Oops!';
                    res.status(500).json({'status': 'failure', 'message': 'internal server error'});
                }
                else{
                    if(length(store_res>0)){
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
            //res.status(500).json({'status': 'failure', 'message': 'internal server error'});
            res.json({'username': 'Ironman', 'stores': [{'name': 'wallet', 'balance': 200}, {'name': 'Iron Bank of Braavos', 'balance': 2000}, {'name': 'Gringotts Wizarding Bank', 'balance': 3000}]})
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