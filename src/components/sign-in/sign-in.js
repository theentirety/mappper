define(['knockout', 'text!./sign-in.html', 'parse', 'hasher'], function(ko, templateMarkup, parse, hasher) {

	function SignIn(params) {
		var self = this;

		this.email = ko.observable();
		this.password = ko.observable();

		this.submit = function() {
			if (self.email() && self.password()) {
				ko.postbox.publish('loading', true);
				ko.postbox.publish('modal.clearError');

				Parse.User.logIn(self.email(), self.password(), {
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
	SignIn.prototype.dispose = function() { };

	return { viewModel: SignIn, template: templateMarkup };

});
