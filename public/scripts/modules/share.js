define(['knockout'], function(ko) {
	return {
		initialize: function() {
			share_show = ko.observable(false);
			share_isLoading = ko.observable().subscribeTo('isLoading');
			share_isDirty = ko.observable(false).subscribeTo('isDirty');
			share_treeId = ko.observable().subscribeTo('treeId');

			share_launch = function() {
				if (share_isDirty()) {
					ko.postbox.publish('save', true);
				}
				if (share_treeId()) {
					share_show(true);
					ko.postbox.publish('isLightboxed', true);
				}
			}

			share_load = function() {

			}

			share_close = function() {
				share_show(false);
				ko.postbox.publish('isLightboxed', false);
			}

			ko.postbox.subscribe('share', function() {
				var currentUser = Parse.User.current();
				if (currentUser) {
					share_launch();
				} else {
					ko.postbox.publish('signIn', true);
				}
			});
		}
	}
});