angular.module('myApp.common.services.myPage', []).

factory('myPage', ['$rootScope', '$sce', '$route', function( $rootScope, $sce, $route ){
	$rootScope.pageTitle = "Upstream Academy Shop"; // for actual title - https://coderwall.com/p/vcfo4q
	var subTitle = "";

	$rootScope.$on('$routeChangeSuccess', function() {
		$rootScope.pageTitle = $route.current.title || $rootScope.pageTitle;
		subTitle = $route.current.subTitle || '';
	});
	return {
		setTitle: function( newTitle, newSubTitle ){
			$rootScope.pageTitle = newTitle;
			subTitle = newSubTitle || '';
		},
		getHTML: function() {
			return $sce.trustAsHtml($rootScope.pageTitle + ' <small>' + subTitle + '</small>');
		}
	};
}]);