(function () {
    'use strict';
 
    angular
        .module('app')
        .controller('Account.IndexController', Controller);
 
    
    function Controller($window, UserService, FlashService) {
        var vm = this;
 
        vm.user = null;
        vm.saveUser = saveUser;
        vm.deleteUser = deleteUser;
 
        initController();
 
        function initController() {
            // getting the current user
            UserService.GetCurrent().then(function (user) {
                vm.user = user;
            });
        }
 
        // saving user
        function saveUser() {
            UserService.Update(vm.user)
                .then(function () {
                    FlashService.Success('User updated');
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }
        
        // deleting user
        function deleteUser() {
            UserService.Delete(vm.user._id)
                .then(function () {
                    // log user out
                    $window.location = '/login';
                })
                .catch(function (error) {
                    FlashService.Error(error);
                });
        }
    }
 
})();