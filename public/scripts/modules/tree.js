define(['knockout'], function(ko) {
	return {
		initialize: function() {
			// auth_signedIn = ko.observable(false).publishOn('signedIn');

			tree_init = function() {

			}

			tree_render = function(data) {

			}

			ko.postbox.subscribe('renderTree', function(data) {
				tree_render(data);
			});

			tree_init();
		}
	}
});