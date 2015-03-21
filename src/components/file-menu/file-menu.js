define(['knockout', 'text!./file-menu.html', 'knockout-postbox'], function(ko, templateMarkup) {

	function FileMenu(params) {
		var self = this;

		this.visible = ko.observable(false).syncWith('file-info.file-menu-visible');
		this.loading = ko.observable(false);

		this.maps = ko.observableArray();

		this.getMaps = function() {
			ko.postbox.publish('loading', true);
			self.maps([]);
			self.loading(true);
			Parse.Cloud.run('getTrees', {}, {
				success: function(result) {
					self.loading(false);
					self.maps(result);
					ko.postbox.publish('loading', false);
				}, 
				error: function(error) {
					console.log(error);
				}
			});
		};

		this.openMap = function(item) {
			self.visible(false);
			ko.postbox.publish('file-info.open-map', {
				id: item.id,
				friendly: item.attributes.friendly,
				numVersions: item.attributes.numVersions
			});
		};

		ko.postbox.subscribe('file-menu.state', function(state) {
			if (state) {
				self.visible(true);
				self.getMaps();
			} else {
				self.visible(false);
			}
		});

	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	FileMenu.prototype.dispose = function() { };

	return { viewModel: FileMenu, template: templateMarkup };

});
