define(['knockout', 'text!./auth.html', 'parse', 'knockout-postbox'], function(ko, templateMarkup, parse) {

	function Auth(params) {
		var self = this;

		// observables
		this.currentUser = ko.observable().publishOn('auth.currentUser');

		// subscriptions
		ko.postbox.subscribe('auth.logout', function() {
			self.logOut();
		});

		ko.postbox.subscribe('auth.login', function(user) {
			self.logIn();
		});

		// private functions
		this.logIn = function(user) {
			self.currentUser(user);
			// ko.postbox.publish('auth.currentUser', self.currentUser());
		};

		this.logOut = function() {
			Parse.User.logOut();
			self.currentUser(null);
			// ko.postbox.publish('auth.currentUser', null);
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
