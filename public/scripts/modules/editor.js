define(['knockout'], function(ko) {
	return {
		initialize: function() {
			// auth_signedIn = ko.observable(false).publishOn('signedIn');

			editor_init = function() {

			}

			editor_render = function() {
				var data;
				ko.postbox.publish('renderTree', data);
			}

			editor_init();
		}
	}
});