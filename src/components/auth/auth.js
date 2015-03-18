define(['knockout', 'text!./auth.html', 'parse', 'knockout-postbox'], function(ko, templateMarkup, parse) {

	function Auth(params) {
		var self = this;

		// observables
		this.currentUser = ko.observable().syncWith('auth.currentUser');

		// subscriptions
		ko.postbox.subscribe('auth.logout', function() {
			self.logOut();
		});

		// private functions
		this.logOut = function() {
			Parse.User.logOut();
			self.currentUser(null);
		};

		this.init = function() {
			if (Parse) {
				self.currentUser(Parse.User.current());
			}
		};

		this.init();
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	Auth.prototype.dispose = function() { };

	return { viewModel: Auth, template: templateMarkup };

});
