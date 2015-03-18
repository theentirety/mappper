define(['knockout', 'text!./modal.html'], function(ko, templateMarkup) {

	function Modal(params) {
		var self = this;

		this.title = ko.observable(params.title);
		this.error = ko.observable('');
		this.confirmation = ko.observable(false);

		this.init = function() {
			var modal = $('.modal-content');
			if (modal) {
				var position = $(modal).position();
				var header = document.createElement('div');
				var title = document.createElement('h1');
				var close = document.createElement('button');
				var error = document.createElement('div');
				var errorMessage = document.createElement('span');
				var errorButton = document.createElement('button');

				$(title).text(this.title()).addClass('title');
				$(errorMessage).attr('data-bind', 'text: error');
				$(errorButton).addClass('md md-radio-button-off').attr('data-bind', 'click: clearError');
				$(error).addClass('error').attr('data-bind', 'css: { \'visible\': error().length > 0, \'confirmation\': confirmation() }').append(errorMessage).append(errorButton);
				$(close).addClass('close-button md md-close md-2x').click(function() {
					self.close();
				});
				$(header).append(title).append(close).addClass('header');
				$('.modal-content').prepend(header).prepend(error);
				ko.applyBindings(self, error);
			}
		};

		this.close = function() {
			document.location.href = '#editor';
		};

		this.showError = function(message) {
			self.confirmation(false);
			self.error(message);
		};

		this.showConfirmation = function(message) {
			self.confirmation(true);
			self.error(message);
		};

		this.clearError = function() {
			self.confirmation(false);
			self.error('');
		};

		ko.postbox.subscribe('modal.setError', function(message) {
			self.showError(message);
		});

		ko.postbox.subscribe('modal.clearError', function(message) {
			self.clearError();
		});

		ko.postbox.subscribe('modal.confirmation', function(message) {
			self.showConfirmation(message);
		});

		this.init();
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	Modal.prototype.dispose = function() { };

	return { viewModel: Modal, template: templateMarkup };

});
