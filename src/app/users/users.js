angular.module( 'orderCloud' )

    .config( UsersConfig )
    .controller( 'UsersCtrl', UsersController )
    .controller( 'UserEditCtrl', UserEditController )
    .controller( 'UserCreateCtrl', UserCreateController )

;

function UsersConfig( $stateProvider ) {
    $stateProvider
        .state( 'users', {
            parent: 'base',
            url: '/users',
            templateUrl:'users/templates/users.tpl.html',
            controller:'UsersCtrl',
            controllerAs: 'users',
            data: {componentName: 'Users'},
            resolve: {
                UserList: function( OrderCloud ) {
                    return OrderCloud.Users.List();
                }
            }
        })
        .state( 'users.edit', {
            url: '/:userid/edit',
            templateUrl:'users/templates/userEdit.tpl.html',
            controller:'UserEditCtrl',
            controllerAs: 'userEdit',
            resolve: {
                SelectedUser: function( $stateParams, OrderCloud) {
                    return OrderCloud.Users.Get( $stateParams.userid);
                }
            }
        })
        .state( 'users.create', {
            url: '/create',
            templateUrl:'users/templates/userCreate.tpl.html',
            controller:'UserCreateCtrl',
            controllerAs: 'userCreate'
        })
}

function UsersController( UserList ) {
    var vm = this;
    vm.list = UserList;
}

function UserEditController( $exceptionHandler, $state, OrderCloud, SelectedUser ) {
    var vm = this,
        userid = SelectedUser.ID;
    vm.userName = SelectedUser.Username;
    vm.user = SelectedUser;
    if(vm.user.TermsAccepted != null) {
        vm.TermsAccepted = true;
    }

    vm.Submit = function() {
        var today = new Date();
        vm.user.TermsAccepted = today;
        OrderCloud.Users.Update(userid, vm.user)
            .then(function() {
                $state.go('buyers.create.step03', {}, {reload:true})
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };

    vm.Delete = function() {
        OrderCloud.Users.Delete(userid)
            .then(function() {
                $state.go('users', {}, {reload:true})
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    }
}

function UserCreateController( $exceptionHandler, $state, OrderCloud, $cookieStore, toastr ) {
    var vm = this;
    vm.user = {Email:"", Password:""};
    vm.Submit = function() {
        var today = new Date();
        vm.user.TermsAccepted = today;
        OrderCloud.Users.Create( vm.user)
            .then(function() {
                $state.go('buyers.create.step03', {}, {reload:true});
                storeCookie();
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
    };

    var storeCookie = function(){
        var newUser = vm.user.FirstName + " " + vm.user.LastName + "\n";
        var userArray = [];
        var savedUsers;

        if($cookieStore.get('usersCreated')){
            savedUsers = $cookieStore.get('usersCreated');
            userArray.push(savedUsers);
            userArray.push(newUser);
            $cookieStore.remove('usersCreated');
            $cookieStore.put('usersCreated', userArray);

            userArray = userArray.join("\n");
            vm.createdUsers = userArray;
            toastr.success('Congratulations you have created the following users: ' + userArray, 'Success');
        } else{
            $cookieStore.put('usersCreated', newUser);
            vm.createdUsers = newUser;
            toastr.success('Congratulations you have created the following user: ' + newUser, 'Success');

        }
    };

    vm.goToStep4 = function(){
        $state.go('buyers.create.step04', {}, {reload:true});
        storeCookie();
        $cookieStore.remove('usersCreated');
    };

    vm.defaultSubmit = function(){
        var today = new Date();
        vm.user.TermsAccepted = today;
        OrderCloud.Users.Create( vm.user)
            .then(function() {
                $state.go('users', {}, {reload:true});
                toastr.success('User Created', 'Success');
            })
            .catch(function(ex) {
                $exceptionHandler(ex)
            });
        };
}

