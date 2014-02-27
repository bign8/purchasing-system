angular.module('myApp.admin', [
	'security',
	'myApp.admin.discounts',
	'myApp.admin.firms',
]).

config(['$routeProvider', 'securityAuthorizationProvider', function($routeProvider, securityAuthorizationProvider) {
	$routeProvider.when('/admin', {
		title: 'Administration',
		templateUrl: 'app/admin/index.tpl.html',
		resolve: {
			user: securityAuthorizationProvider.requireAdminUser
		}
	});
}]);