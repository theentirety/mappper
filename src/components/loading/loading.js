define(['knockout', 'text!./loading.html', 'knockout-postbox'], function(ko, templateMarkup) {

	function Loading(params) {
		var self = this;

		this.loading = ko.observable(false);
		this.message = ko.observable('Loading').syncWith('loading.message');

		ko.postbox.subscribe('loading', function(newValue) {
			if (newValue) {
				self.loading(true);
			} else {
				self.loading(false);
			}
		});
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	Loading.prototype.dispose = function() { };

	return { viewModel: Loading, template: templateMarkup };

});
