angular.module( 'orderCloud' )

    .config( BuyerConfig )
    .controller( 'BuyerCtrl', BuyerController )
    .controller( 'BuyerEditCtrl', BuyerEditController )
    .controller( 'BuyerCreateCtrl', BuyerCreateController )
    .controller( 'BuyersProductListController', BuyersProductListController)

;

function BuyerConfig( $stateProvider ) {
    $stateProvider
        .state( 'buyers', {
            parent: 'base',
            url: '/buyers',
            templateUrl: 'buyers/templates/buyers.tpl.html',
            controller: 'BuyerCtrl',
            controllerAs: 'buyers',
            data: { componentName: 'Microsites' },
            resolve: {
                BuyerList: function(OrderCloud) {
                    return OrderCloud.Buyers.List();
                }
            }
        })
        .state( 'buyers.edit', {
            url: '/:buyerid/edit',
            templateUrl: 'buyers/templates/buyerEdit.tpl.html',
            controller: 'BuyerEditCtrl',
            controllerAs: 'buyerEdit',
            resolve: {
                SelectedBuyer: function($stateParams, OrderCloud) {
                    return OrderCloud.Buyers.Get($stateParams.buyerid);
                }
            }
        })
        .state( 'buyers.create', {
            url: '/create',
            templateUrl: 'buyers/templates/buyerCreate.tpl.html',
            controller: 'BuyerCreateCtrl',
            controllerAs: 'buyerCreate'
        })
        .state( 'buyers.create.step01', {
            url: '/step01',
            templateUrl: 'buyers/templates/buyerCreate-step01.tpl.html'
        })
        .state( 'buyers.create.step02', {
            url: '/step02',
            templateUrl: 'buyers/templates/buyerCreate-step02.tpl.html',
            controller: 'BuyersProductListController',
            controllerAs: 'step2',
            resolve: {
                ProductList: function(OrderCloud){
                    return OrderCloud.Products.List();
                }
            }
        })
        .state( 'buyers.create.step03', {
            url: '/step03',
            templateUrl: 'buyers/templates/buyerCreate-step03.tpl.html',
            controller: 'UserCreateCtrl',
            controllerAs: 'userCreate'
        })
        .state( 'buyers.create.step04', {
            url: '/step04',
            templateUrl: 'buyers/templates/buyerCreate-step04.tpl.html'
        })
        .state( 'buyers.create.step05', {
            url: '/step05',
            templateUrl: 'buyers/templates/buyerCreate-step05.tpl.html'
        })
        .state( 'buyers.create.step06', {
                url: '/step06',
                templateUrl: 'buyers/templates/buyerCreate-step06.tpl.html'
        });
}

function BuyerController(BuyerList) {
    var vm = this;
    vm.list = BuyerList;
}

function BuyerEditController($exceptionHandler, $state, SelectedBuyer, OrderCloud) {
    var vm = this;
    vm.buyer = SelectedBuyer;
    vm.buyerName = SelectedBuyer.Name;

    vm.Submit = function() {
        OrderCloud.Buyers.Update(vm.buyer)
            .then(function() {
                $state.go('buyers', {}, {reload:true});
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    };

    /*vm.Delete = function(){
        OrderCloud.Buyers.Delete(vm.buyer.ID);
    }*/
}

function BuyerCreateController($exceptionHandler, $state, OrderCloud, toastr) {
    var vm = this;

    vm.Submit = function () {
        OrderCloud.Buyers.Create(vm.buyer)
            .then(function(data) {
                OrderCloud.BuyerID.Set(data.ID);
                $state.go('buyers.create.step02', {}, {reload:true});
                toastr.success('You have created a new microsite!', 'Success')
            })
            .catch(function(ex) {
                $exceptionHandler(ex);
            });
    }
}

function BuyersProductListController(ProductList,Underscore, $q, OrderCloud, toastr){
    var vm = this;
    vm.products = Underscore.uniq(ProductList.Items, false, function(uniqueproduct){
        return uniqueproduct.Name;
    });


    vm.toggleSelection = function(product){
        product.selected = !product.selected;
    };

    vm.addToCatalog = function(){

        var selectedProducts =[];
        var queue =[];
        var dfd = $q.defer();

        angular.forEach(vm.products, function(product){
            if(product.selected){
                delete product.ID;
                selectedProducts.push(product);
            }
        });

        $q.all(queue)
            .then(function(){
                if(selectedProducts.length){
                    toastr.success('The selected Products were added to your Catalog!', 'Success');
                    dfd.resolve();
                } else{
                    toastr.warning('No products were selected', 'Warning');
                    dfd.resolve();
                }
            })
            .catch(function(){
                dfd.reject();
                toastr.error('There was a problem adding the products to your Catalog', 'Error');
            });

        return dfd.promise;
    };


}
