define(['knockout', 'text!./file.html', 'parse', 'hasher', 'knockout-postbox'], function(ko, templateMarkup, parse, hasher) {

	function File(params) {
		var self = this;

		this.title = ko.observable('(untitled)').syncWith('file.map-title');
		this.mapId = ko.observable().syncWith('file.map-id');
		this.numVersions = ko.observable(-1);
		this.version = ko.observable(-1);
		this.versionId = ko.observable().syncWith('file.version-id');
		this.isDirty = ko.observable(false).syncWith('tree.isDirty');
		this.viewMenuVisible = ko.observable(false);
		this.fileMenuVisible = ko.observable(false).syncWith('file-info.file-menu-visible');

		this.shareUrl = ko.computed(function() {
			var domain = 'product-map-dev';
			return 'http://' + domain + '.parseapp.com/#view?id=' + self.mapId() + '=' + self.versionId();
		});

		this.toggleFileMenu = function() {
			if (Parse.User.current()) {
				if (self.fileMenuVisible()) {
					self.fileMenuVisible(false);
				} else {
					self.fileMenuVisible(true);
				}
				ko.postbox.publish('file-menu.state', self.fileMenuVisible());
			} else {
				hasher.setHash('sign-in');
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

		this.save = function() {
			var currentUser = Parse.User.current();
			if (currentUser) {

				if (!self.mapId()) {

					var friendly = prompt('What do you want to call this map?');

					if (!friendly) {
						return;
					}

					ko.postbox.publish('loading', true);

					// first save - do the tree save, then the version
					Parse.Cloud.run('saveTree', {
						friendly: friendly
					}).then(function(result) {
						self.mapId(result.id);
						self.title(result.attributes.friendly);
						self.numVersions(1);
						self.version(1);
						self.isDirty(false);
						return Parse.Cloud.run('saveTreeVersion', {
							treeData: $('#tree').html(),
							treeId: result.id
						});
					}).then(function(version) {
						console.log(version)
						self.mapId(version.attributes.tree.id);
						ko.postbox.publish('loading', false);
					}, function(error) {
						ko.postbox.publish('loading', false);
						console.log(error);
						alert('We ran into a problem saving the map. Please try again.');
					});

				} else {
					ko.postbox.publish('loading', true);

					// existing object - save just the version
					Parse.Cloud.run('saveTreeVersion', {
						treeData: $('#tree').html(),
						treeId: self.mapId()
					}, {
						success: function(version) {
							// editor_completeSave(result);
							// editor_resetDraftStatus();
							console.log(version)
							var numVersions = self.numVersions() + 1;
							self.numVersions(numVersions);
							self.version(numVersions);
							self.isDirty(false);
							ko.postbox.publish('loading', false);
						}, 
						error: function(error) {
							ko.postbox.publish('loading', false);
							console.log(error);
							alert('We ran into a problem saving the map. Please try again.');
						}
					});
				}

			} else {
				hasher.setHash('sign-in');
			}
		}

		this.share = function() {
			self.createShareableUrl();
		};

		this.createShareableUrl = function() {
			console.log(self.mapId(), self.versionId())
			if (self.mapId() && self.versionId()) {
				gapi.client.setApiKey('AIzaSyDbqlcHF8cEjnVcIIIv3hEJBnZFWIPIyu4');
				gapi.client.load('urlshortener', 'v1').then(function() {
					return gapi.client.urlshortener.url.insert({
						'longUrl': self.shareUrl()
					});
				}).then(function(response) {
					console.log(response.result.id);
				});
			}
		};

		ko.postbox.subscribe('auth.logout', function() {
			self.fileMenuVisible(false);
			self.viewMenuVisible(false);
		});

		ko.postbox.subscribe('file-info.open-map', function(map) {
			ko.postbox.publish('loading', true);
			self.mapId(map.id);
			self.title(map.friendly);
			self.isDirty(false);
			self.numVersions(map.numVersions);
			self.version(map.numVersions);

			Parse.Cloud.run('loadTreeVersion', {
				treeId: self.mapId()
			}, {
				success: function(version) {
					self.versionId(version.id);
					ko.postbox.publish('tree.load', version.attributes.data);
					self.isDirty(false);
					ko.postbox.publish('loading', false);
				}, 
				error: function(error) {
					ko.postbox.publish('loading', false);
					console.log(error);
					alert('We ran into a problem loading the map. Please try again.');
				}
			});
		});

	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	File.prototype.dispose = function() { };

	return { viewModel: File, template: templateMarkup };

});
