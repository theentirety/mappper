define(['knockout', 'text!./legal.html'], function(ko, templateMarkup) {

	function Legal(params) {
		var self = this;
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	Legal.prototype.dispose = function() { };

	return { viewModel: Legal, template: templateMarkup };

});
