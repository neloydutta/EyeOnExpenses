var app = angular.module('eoe_app', []);
app.controller('eoe_ctrl', function($scope, $http) {
    $scope.store_list = {};
    $scope.username = 'ironman';
    $scope.total_balance = 0;
    $scope.transfer_tostore = "";
    $scope.transfer_fromstore = "";
    $scope.transfer_amt = 0;
    $scope.retrieve_storelist = function(){
        $http.get('/api/stores-list?username='+$scope.username).then(
            function(response) {
                $scope.store_list = response.data;
                $scope.calculate_totalbalance();
            },
            function(error){
                alert(error);
        });
    }

    $scope.calculate_totalbalance = function(){
        $scope.total_balance = 0;
        for(i=0; i<$scope.store_list.stores.length; i++){
            $scope.total_balance += $scope.store_list.stores[i].balance;
        }
    }

    $scope.store_add_balance = function(store){
        query_url = '/api/store-add-balance?username='+$scope.username+'&store='+store+'&amount'
        $scope.calculate_totalbalance();
    }

    $scope.transfer_balance = function(){
        query_url = '/api/store-transfer-balance?username='+$scope.username+'&tostore='+$scope.transfer_tostore+'&fromstore='+$scope.transfer_fromstore+'&amt='+$scope.transfer_amt;
        if($scope.transfer_fromstore == "" || $scope.transfer_tostore == "" || $scope.transfer_fromstore == $scope.transfer_tostore || $scope.transfer_amt == 0.0){
            $scope.create_alert('#tbalert_placeholder', 'alert-danger', 'enter proper values!');
            return;
        }
        $http.get(query_url).then(
            function(response){
                if(response.data.status == 'success'){
                    for(i=0; i<$scope.store_list.stores.length; i++){
                        if($scope.store_list.stores[i].name == $scope.transfer_fromstore){
                            $scope.store_list.stores[i].balance -= $scope.transfer_amt;
                        }
                        if($scope.store_list.stores[i].name == $scope.transfer_tostore){
                            $scope.store_list.stores[i].balance += $scope.transfer_amt;
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

    $scope.create_alert = function(id, type, message){
        $(id).html('<div class="alert '+type+' alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'+message+'</div>');
    }

    $scope.retrieve_storelist();
});

