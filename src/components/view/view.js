define(['knockout', 'text!./view.html', 'hasher', 'knockout-postbox'], function(ko, templateMarkup, hasher) {

	function View(params) {
		var self = this;

		this.title = ko.observable('(untitled)').syncWith('file.map-title');
		this.mapId = ko.observable().syncWith('file.map-id');
		this.version = ko.observable().syncWith('file.version-number');
		this.versions = ko.observableArray();

		this.init = function() {
			ko.postbox.publish('loading', true);
			var currentPage = hasher.getHash();
			self.mapId(params.map);
			self.version(params.version);
			self.load();
		};

		this.load = function() {
			if (self.mapId()) {
				Parse.Cloud.run('getTreeVersions', {
					treeId: self.mapId()
				}, {
					success: function(result) {
						self.versions(result);
						var map = null;
						if (self.version()) {
							map = result[self.versions().length - self.version()];
						} else {
							map = result[0];
						}
						if (map) {
							self.title(map.attributes.tree.attributes.friendly);
							self.mapId(map.id);
							var mapString = JSON.stringify(map.attributes.data);
							ko.postbox.publish('map.render', mapString);
							ko.postbox.publish('loading', false);
						} else {
							alert('This link is not a valid map version.');
						}
					}, 
					error: function(error) {
						console.log(error)
						alert('There was an error loading the map. Please make sure the map ID ' + self.mapId() + ' is valid and refresh the page.');
					}
				});
			}
		};

		this.init();
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	View.prototype.dispose = function() { };

	return { viewModel: View, template: templateMarkup };

});
