define(['knockout', 'text!./file.html', 'parse', 'knockout-postbox'], function(ko, templateMarkup, parse) {

	function File(params) {
		var self = this;

		this.title = ko.observable('(untitled)');
		this.activeVersionNumber = ko.observable(-1);
		this.isDirty = ko.observable(false).subscribeTo('tree.isDirty');
		this.viewMenuVisible = ko.observable(false);

		this.open = function() {
			if (Parse.User.current()) {

			} else {
				document.location.href = '#sign-in';
			}
		};

		this.toggleViewMenu = function() {
			if (self.viewMenuVisible()) {
				self.viewMenuVisible(false);
			} else {
				self.viewMenuVisible(true);
			}
			ko.postbox.publish('view-menu.state', self.viewMenuVisible());
		};

	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	File.prototype.dispose = function() { };

	return { viewModel: File, template: templateMarkup };

});
