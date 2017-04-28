var app = angular.module('eoe_app', []);
app.controller('eoe_ctrl', function($scope, $http) {
    $scope.store_list = {};
    $scope.username = '';
    $scope.total_balance = 0;
    $scope.transfer_tostore = "";
    $scope.transfer_fromstore = "";
    $scope.transfer_amt = 0;
    $scope.store_add_amt = 0;
    $scope.add_balance_store = "";
    $scope.new_store_name = "";
    $scope.new_store_amt = 0;
    $scope.rm_store_name = "";
    $scope.ne_reason = "";
    $scope.ne_amount = 0;
    $scope.ne_fromstore = "";
    $scope.ne_when = "";
    $scope.expenses = {};
    $scope.log = {}
    $scope.dlog = []
    $scope.retrieve_storelist = function(){
        $http.get('/api/stores-list?username='+$scope.username).then(
            function(response) {
                $scope.store_list = response.data;
                $scope.calculate_totalbalance();
            },
            function(error){
                console.log("Error Message: "+error.data.message);
                $scope.create_alert('#alert_placeholder', 'alert-danger', 'Oops! Something doesn\'t seem to be right!');
        });
    }

    $scope.retrieve_expenselist = function(){
        $http.get('/api/expenses-list?username='+$scope.username).then(
            function(response) {
                $scope.expenses = response.data;
            },
            function(error){
                console.log("Error Message: "+error.data.message);
                $scope.create_alert('#alert_placeholder', 'alert-danger', 'Oops! Something doesn\'t seem to be right!');
        });
    }

    $scope.calculate_totalbalance = function(){
        $scope.total_balance = 0;
        for(i=0; i<$scope.store_list.stores.length; i++){
            $scope.total_balance += parseInt($scope.store_list.stores[i].balance);
        }
    }

    $scope.set_add_balance_store = function(store){
        $scope.add_balance_store = store;
    }

    $scope.store_add_balance = function(){
        query_url = '/api/store-add-balance?username='+$scope.username+'&store='+$scope.add_balance_store+'&amt='+$scope.store_add_amt;
        if($scope.add_balance_store == "" || $scope.store_add_amt <= 0.0){
            $scope.create_alert('#abalert_placeholder', 'alert-danger', 'enter proper values!');
            return;
        }
        $http.get(query_url).then(
            function(response){
                if(response.data.status == 'success'){
                    for(i=0; i<$scope.store_list.stores.length; i++){
                        if($scope.store_list.stores[i].name == $scope.add_balance_store){
                            $scope.store_list.stores[i].balance = parseInt($scope.store_list.stores[i].balance) + $scope.store_add_amt;
                        }
                    }
                    $scope.store_add_amt = 0;
                    $scope.create_alert('#abalert_placeholder', 'alert-success', 'Balance successfully added!');
                }
            },
            function(error){
                $scope.transfer_amt = 0;
                $scope.transfer_fromstore = "";
                $scope.transfer_tostore = "";
                $scope.create_alert('#abalert_placeholder', 'alert-danger', 'Add-Balance-To_store failed!');
            }
        );
        $scope.calculate_totalbalance();
    }

    $scope.transfer_balance = function(){
        query_url = '/api/store-transfer-balance?username='+$scope.username+'&tostore='+$scope.transfer_tostore+'&fromstore='+$scope.transfer_fromstore+'&amt='+$scope.transfer_amt;
        if($scope.transfer_fromstore == "" || $scope.transfer_tostore == "" || $scope.transfer_fromstore == $scope.transfer_tostore || $scope.transfer_amt <= 0.0){
            $scope.create_alert('#tbalert_placeholder', 'alert-danger', 'enter proper values!');
            return;
        }
        $http.get(query_url).then(
            function(response){
                if(response.data.status == 'success'){
                    for(i=0; i<$scope.store_list.stores.length; i++){
                        if($scope.store_list.stores[i].name == $scope.transfer_fromstore){
                            $scope.store_list.stores[i].balance = parseInt($scope.store_list.stores[i].balance) - $scope.transfer_amt;
                        }
                        if($scope.store_list.stores[i].name == $scope.transfer_tostore){
                            $scope.store_list.stores[i].balance = parseInt($scope.store_list.stores[i].balance) + $scope.transfer_amt;
                        }
                    }
                    $scope.transfer_amt = 0;
                    $scope.transfer_fromstore = "";
                    $scope.transfer_tostore = "";
                    $scope.create_alert('#tbalert_placeholder', 'alert-success', 'Balance successfully transfered!');
                }
            },
            function(error){
                $scope.transfer_amt = 0;
                $scope.transfer_fromstore = "";
                $scope.transfer_tostore = "";
                $scope.create_alert('#tbalert_placeholder', 'alert-danger', 'Balance transfer failed!');
            }
        );
        $scope.calculate_totalbalance();
    }

    $scope.add_new_store = function(){
        query_url = '/api/add-store?username='+$scope.username+'&store='+$scope.new_store_name+'&balance='+$scope.new_store_amt;
        if($scope.new_store_name == "" || $scope.new_store_amt <= 0.0){
            $scope.create_alert('#nsalert_placeholder', 'alert-danger', 'Enter proper values!');
            return;
        }
        $http.get(query_url).then(
            function(response){
                if(response.data.status == 'success'){
                    new_store = {'name': $scope.new_store_name, 'balance': $scope.new_store_amt};
                    $scope.store_list.stores.push(new_store);
                    $scope.new_store_amt = 0;
                    $scope.new_store_name = "";
                    $scope.calculate_totalbalance();
                    $scope.create_alert('#nsalert_placeholder', 'alert-success', 'Store successfully added!');
                }
            },
            function(error){
                $scope.new_store_amt = 0;
                $scope.new_store_name = "";
                $scope.create_alert('#nsalert_placeholder', 'alert-danger', 'Add-Store Failed!');
            }
        );
    }

    $scope.set_rm_store = function(store){
        $scope.rm_store_name = store;
    }

    $scope.delete_store = function(){
        query_url = '/api/remove-store?username='+$scope.username+'&store='+$scope.rm_store_name;
        if($scope.rm_store_name == ""){
            $scope.create_alert('#alert_placeholder', 'alert-danger', 'improper values!');
            return;
        }
        $http.get(query_url).then(
            function(response){
                for(i=0; i<$scope.store_list.stores.length; i++){
                    if($scope.store_list.stores[i].name == $scope.rm_store_name){
                        is_available_flag = true;
                        $scope.store_list.stores.splice(i, 1);
                        break;
                    }
                }
                $scope.rm_store_name = "";
                $scope.calculate_totalbalance();
                $scope.create_alert('#alert_placeholder', 'alert-success', 'Store Successfully Removed!');
            },
            function(error){
                console.log("Error Message: "+error.data.message);
                $scope.create_alert('#alert_placeholder', 'alert-danger', 'Store-Remove Failed!');
            }
        );
    }

    $scope.add_new_expense = function(){
        query_url = '/api/add-expense?username='+$scope.username+'&store='+$scope.ne_fromstore+'&amt='+$scope.ne_amount+'&when='+$scope.ne_when+'&reason='+$scope.ne_reason;
        if($scope.ne_amount <= 0 || $scope.ne_fromstore == "" || $scope.ne_reason == "" || $scope.ne_when == ""){
            $scope.create_alert('#nealert_placeholder', 'alert-danger', 'Enter proper values!');
            return;
        }
        $http.get(query_url).then(
            function(response){
                if(response.data.status == 'success'){
                    $scope.expenses.expense_cur.push({'reason': $scope.ne_reason, 'amount': $scope.ne_amount, 'fromstore': $scope.ne_fromstore, 'when': new Date($scope.ne_when)});
                    for(i=0; i<$scope.store_list.stores.length; i++){
                        if($scope.store_list.stores[i].name == $scope.ne_fromstore){
                            $scope.store_list.stores[i].balance -= $scope.ne_amount;
                        }
                    }
                    $scope.calculate_totalbalance();
                    $scope.ne_reason = "";
                    $scope.ne_amount = 0;
                    $scope.ne_fromstore = "";
                    $scope.ne_when = "";
                    $scope.create_alert('#nealert_placeholder', 'alert-success', 'Expense Successfully Added!');
                }
            },
            function(error){
                console.log('Error Message: '+error.data.message);
                $scope.create_alert('#nealert_placeholder', 'alert-danger', 'Add-Expense Failed!');
            }
        );
    }

    $scope.reset_recent = function(){
        query_url = '/api/reset-recent?username='+$scope.username;
        $http.get(query_url).then(
            function(response){
                if(response.data.status == 'success'){
                    $scope.expenses.expense_history.push.apply($scope.expenses.expense_history, $scope.expenses.expense_cur);
                    $scope.expenses.expense_cur = [];
                    $scope.create_alert('#alert_placeholder', 'alert-success', 'Reset-Recent-Expense, Successfull!');
                }
            },
            function(error){
                console.log('Error Message: '+error.data.message);
                $scope.create_alert('#alert_placeholder', 'alert-danger', 'Reset-Recent-Expense, Failed!');
            }
        );
    }

    $scope.retrieve_log = function(){
        query_url = '/api/statement?username='+$scope.username;
        $http.get(query_url).then(
            function(response){
                $scope.log = response.data.log[0];
                $scope.dlog = $scope.log.log;
                console.log($scope.dlog);
            },
            function(error){
                console.log("Error Message: "+error.data.message);
                $scope.create_alert('#alert_placeholder', 'alert-danger', 'Oops! Something doesn\'t seem to be right!');
            }
        );
    }

    $scope.create_alert = function(id, type, message){
        $(id).append('<div class="alert '+type+' alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'+message+'</div>');
        var id = id.slice(1);
        setTimeout(function doYourThing(){
            var node = document.getElementById(id);
            node.removeChild(node.firstChild);
        }, 10000);
    }

    $scope.update_dlog = function(){
        $scope.dlog = [];
        for(i=0; i<$scope.log.log.length; i++){
            if($scope.log.log[i]['store'] == $scope.statement_store){
                $scope.dlog.push($scope.log.log[i]);
            }
        }
    }

    $scope.retrieve_username = function(){
        var url = window.location.href;
        url = url.split('/');
        $scope.username = url[url.length - 1];
        console.log($scope.username);
    } 

    $scope.logout = function(){
        $http.post('/auth/logout').then(
            function(response){
                $scope.create_alert('#alert_placeholder', 'alert-success', 'Successfully logged out!');
                window.location.href = '/';
            },
            function(error){
                $scope.create_alert('#alert_placeholder', 'alert-danger', 'Oops! Logout was\'nt successfull!');
            }
        );
    }

    $scope.retrieve_username();
    $scope.retrieve_storelist();
    $scope.retrieve_expenselist();
    $scope.retrieve_log();
});

$(function() {
    $("#datepicker").datepicker({ dateFormat: 'mm-dd-yy' });
});
