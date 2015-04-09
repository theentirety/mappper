define(['knockout', 'text!./forgot-password.html', 'parse'], function(ko, templateMarkup, parse) {

	function ForgotPassword(params) {
		var self = this;

		this.email = ko.observable();

		this.submit = function() {
			if (self.email()) {
				ko.postbox.publish('loading', true);
				ko.postbox.publish('modal.clearError');

				Parse.User.requestPasswordReset(self.email(), {
					success: function() {
						ko.postbox.publish('loading', false);
						ko.postbox.publish('modal.confirmation', 'Reset email sent to ' + self.email());
					},
					error: function(error) {
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
	ForgotPassword.prototype.dispose = function() { };

	return { viewModel: ForgotPassword, template: templateMarkup };

});
