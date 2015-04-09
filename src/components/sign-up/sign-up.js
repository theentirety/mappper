define(['knockout', 'text!./sign-up.html', 'parse', 'hasher'], function(ko, templateMarkup, parse, hasher) {

	function SignUp(params) {
		var self = this;

		this.email = ko.observable();
		this.password = ko.observable();
		this.confirmpassword = ko.observable();

		this.submit = function() {
			if (self.email() && self.password() && self.confirmpassword()) {
				if (self.password() == self.confirmpassword()) {
					ko.postbox.publish('loading', true);
					ko.postbox.publish('modal.clearError');

					var user = new Parse.User();
					user.set("username", self.email());
					user.set("password", self.password());
					user.set("email", self.email());

					user.signUp(null, {
						success: function(user) {
							ko.postbox.publish('auth.login', user);
							ko.postbox.publish('loading', false);
							hasher.setHash('editor');
						},
						error: function(user, error) {
							ko.postbox.publish('loading', false);
							ko.postbox.publish('modal.setError', self.sanitizeErrors(error));
							console.log(error);
						}
					});
				} else {
					// password mismatch
					ko.postbox.publish('modal.setError', 'The passwords do not match');
				}
				return false;
			}
		}

		this.sanitizeErrors = function(error) {
			switch(error.code) {
				case 124:
					return 'Oops! We messed up. Please try again.';
				default:
					return error.message.charAt(0).toUpperCase() + error.message.slice(1);
			}
		}
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	SignUp.prototype.dispose = function() { };

	return { viewModel: SignUp, template: templateMarkup };

});
