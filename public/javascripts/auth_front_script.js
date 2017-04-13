var app = angular.module('eoeauth_app', []);
app.controller('eoeauth_ctrl', function($scope, $http) {
    $scope.isavailable = false;
    $scope.dosignup = function(){
        if($scope.spassword != $scope.scpassword){
            $scope.create_alert('#alert_placeholder', 'alert-warning', 'Passwords doesn\'t match!');
            return;
        }
        if($scope.isavailable){
            $http.post('/auth/signup', {username: $scope.susername, password: $scope.spassword}).then(
                function(response){
                    $scope.susername = "";
                    $scope.spassword = "";
                    $scope.scpassword = "";
                    document.getElementById("udiv").setAttribute("class", "");
                    document.getElementById("uspan").setAttribute("class", "");
                    $scope.create_alert('#alert_placeholder', 'alert-success', 'Sign-Up Successfull!');
                    $scope.create_alert('#alert_placeholder', 'alert-info', 'Please Sign-In to enter the app!');
                },
                function(error){
                    console.log(error.data.message);
                    $scope.create_alert('#alert_placeholder', 'alert-danger', 'Sign-Up Failed!');
                }
            );
            
        }
        else{
            $scope.create_alert('#alert_placeholder', 'alert-danger', 'Select a proper username!');
        }

    }
    $scope.dosignin = function(){
        if($scope.lusername && $scope.lpassword){
            $http.post('/auth/signin', { username: $scope.lusername, password: $scope.lpassword}).then(
                function(response){
                    $scope.lusername = "";
                    $scope.lpassword = "";
                    $scope.create_alert('#alert_placeholder', 'alert-success', 'Sign-In Successfull!');
                },
                function(error){
                    console.log(error.data.message);
                    $scope.create_alert('#alert_placeholder', 'alert-danger', 'Sign-Up Failed!');
                }
            );
        }
        else{
             $scope.create_alert('#alert_placeholder', 'alert-danger', 'Enter proper values!');
        }
    }

    $scope.checkavailability = function(){
        if($scope.susername == undefined){
            $scope.isavailable = false;
            document.getElementById("udiv").setAttribute("class", "form-group has-error has-feedback");
            document.getElementById("uspan").setAttribute("class", "glyphicon glyphicon-remove form-control-feedback");
            return;
        }
        $http.get('/auth/useravailcheck?username='+$scope.susername).then(
            function(response){
                if(response.data.status == "success"){
                    if(response.data.availability){
                        $scope.isavailable = true;
                        document.getElementById("udiv").setAttribute("class", "form-group has-success has-feedback");
                        document.getElementById("uspan").setAttribute("class", "glyphicon glyphicon-ok form-control-feedback");
                    }
                    else{
                        $scope.isavailable = false;
                        document.getElementById("udiv").setAttribute("class", "form-group has-error has-feedback");
                        document.getElementById("uspan").setAttribute("class", "glyphicon glyphicon-remove form-control-feedback");
                    }
                }
            },
            function(error){
                console.log('Error Message: '+error.data.message);
                $scope.create_alert('#alert_placeholder', 'alert-danger', 'Oops! Something doesn\'t seem to be right!\nServer is responding abnormally!');
            }
        );
    }

    $scope.create_alert = function(id, type, message){
        $(id).append('<div class="alert '+type+' alert-dismissable fade in"><a href="#" class="close" data-dismiss="alert" aria-label="close">&times;</a>'+message+'</div>');
        var id = id.slice(1);
        setTimeout(function doYourThing(){
            var node = document.getElementById(id);
            if(node.firstChild){
                node.removeChild(node.firstChild);
            }
        }, 10000);
    }
});