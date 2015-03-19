define(['knockout', 'text!./treetools.html', 'knockout-postbox'], function(ko, templateMarkup) {

	function Treetools(params) {
		var self = this;

		this.topPosition = ko.observable(0);
		this.visible = ko.observable(false);

		ko.postbox.subscribe('tree.selection-top', function(topPosition) {
			if (topPosition >= 0) {
				self.topPosition(topPosition);
				self.visible(true);
			} else {
				self.visible(false);
			}
		});
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	Treetools.prototype.dispose = function() { };

	return { viewModel: Treetools, template: templateMarkup };

});
