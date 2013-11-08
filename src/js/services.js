angular.module('myApp.services', [

]).

factory('myPage', function( ){
	var pageTitle = "Untitled";

	return {
		setTitle: function( newTitle ){
			pageTitle = newTitle;
		},
		getTitle: function() {
			return pageTitle;
		}
	};
});