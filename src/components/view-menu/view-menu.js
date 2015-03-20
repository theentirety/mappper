define(['knockout', 'text!./view-menu.html', 'knockout-postbox'], function(ko, templateMarkup) {

	function ViewMenu(params) {
		var self = this;

		this.visible = ko.observable(false).subscribeTo('view-menu.state');
		this.orientation = ko.observable('square').publishOn('view-menu.orientation');

		this.zoomIn = function() {
			ko.postbox.publish('view-menu.zoom-in');
		};

		this.zoomOut = function() {
			ko.postbox.publish('view-menu.zoom-out');
		};

		this.setOrientation = function(orientation) {
			self.orientation(orientation);
		};

	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	ViewMenu.prototype.dispose = function() { };

	return { viewModel: ViewMenu, template: templateMarkup };

});
