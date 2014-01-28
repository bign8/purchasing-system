angular.module('myApp.admin', [
	'security',
	'myApp.admin.discounts'
]).

config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider) {
	$routeProvider.when('/admin', {
		title: 'Administration',
		templateUrl: 'partials/admin/index.tpl.html',
		resolve: {
			user: securityAuthorizationProvider.requireAdminUser
		}
	});
}]);