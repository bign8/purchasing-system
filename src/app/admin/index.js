angular.module('myApp.admin', [
	'security',
	'myApp.admin.discounts',
	'myApp.admin.fields',
	'myApp.admin.files',
	'myApp.admin.firms',
	'myApp.admin.items',
	'myApp.admin.merge',
	'myApp.admin.purchases',
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