define(['knockout', 'text!./auth.html', 'parse', 'knockout-postbox'], function(ko, templateMarkup, parse) {

	function Auth(params) {
		var self = this;

		// observables
		this.currentUser = ko.observable().publishOn('auth.currentUser');

		// subscriptions

		// private functions
		this.logIn = function(user) {
			self.currentUser(user);
			// ko.postbox.publish('auth.currentUser', self.currentUser());
		};

		this.logOut = function() {
			if (Parse.User.current()) {
				Parse.User.logOut();
				self.currentUser(null);
				ko.postbox.publish('auth.logout');
			}
		};

		this.init = function() {
			if (Parse) {
				self.logIn(Parse.User.current());
			}
		};

		this.init();
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	Auth.prototype.dispose = function() { };

	return { viewModel: Auth, template: templateMarkup };

});
