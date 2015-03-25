define(['knockout', 'text!./file.html', 'parse', 'hasher', 'knockout-postbox'], function(ko, templateMarkup, parse, hasher) {

	function FileInfoView(params) {
		var self = this;

		this.title = ko.observable('(untitled)').syncWith('file.map-title');
		this.mapId = ko.observable().syncWith('file.map-id');
		this.numVersions = ko.observable(-1);
		this.version = ko.observable().syncWith('file.version-number');
		this.versionId = ko.observable().syncWith('file.version-id');
		this.viewMenuVisible = ko.observable(false);
		this.loggedIn = ko.observable(false);

		this.init = function() {
			if (Parse.User.current()) {
				self.loggedIn(true);
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

		this.init();

	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	FileInfoView.prototype.dispose = function() { };

	return { viewModel: FileInfoView, template: templateMarkup };

});
