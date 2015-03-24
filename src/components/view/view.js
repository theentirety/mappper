define(['knockout', 'text!./view.html', 'hasher', 'knockout-postbox'], function(ko, templateMarkup, hasher) {

	function View(params) {
		var self = this;

		this.title = ko.observable('(untitled)').syncWith('file.map-title');
		this.mapId = ko.observable().syncWith('file.map-id');
		this.version = ko.observable(-1);
		this.versions = ko.observableArray();

		this.init = function() {
			var currentPage = hasher.getHash();
			self.mapId(params.map);
			self.version(params.version);
			self.load();
		};

		this.load = function() {
			ko.postbox.publish('loading', true);
			if (self.mapId() && self.version() > 0) {
				Parse.Cloud.run('getTreeVersions', {
					treeId: self.mapId()
				}, {
					success: function(result) {
						self.versions(result);
						console.log(result[self.versions().length - self.version()])
						var map = result[self.versions().length - self.version()];
						if (map) {
							self.title(map.attributes.tree.attributes.friendly);
							$('#map').html(map.attributes.data);
							// viewer_activeVersionNumber(result.attributes.tree.attributes.numVersions);
							ko.postbox.publish('tree.render');
							ko.postbox.publish('attachTreeBindings');


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
