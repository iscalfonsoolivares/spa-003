export default function appConfig( $routeProvider ) {
  
    'ngInject';
  
    $routeProvider

        // route for the home page
        .when('/home', {
            templateUrl : 'home.html',
            controller  : 'MyController'
        })
    
        .otherwise({
          redirectTo: '/home'
        });    

  
}