define(['knockout', 'text!./file.html', 'parse', 'hasher', 'knockout-postbox'], function(ko, templateMarkup, parse, hasher) {

	function File(params) {
		var self = this;

		this.title = ko.observable('(untitled)').syncWith('file.map-title');
		this.mapId = ko.observable().syncWith('file.map-id');
		this.numVersions = ko.observable(-1).syncWith('file-info.num-versions');
		this.version = ko.observable().syncWith('file.version-number');
		this.versionId = ko.observable().syncWith('file.version-id');
		this.isDirty = ko.observable(false).syncWith('tree.isDirty');
		this.viewMenuVisible = ko.observable(false);
		this.fileMenuVisible = ko.observable(false).syncWith('file-info.file-menu-visible');
		this.versionMenuVisible = ko.observable(false).syncWith('file-info.version-menu-visible');
		this.loggedIn = ko.observable(false);
		this.treeExpanded = ko.observable(true).subscribeTo('tree.expanded');

		this.shareUrl = ko.computed(function() {
			var url = null;
			if (self.mapId()) {
				url = hasher.getBaseURL() + '#v/' + self.mapId();
				if (self.version() != self.numVersions()) {
					url = url + '/' + self.version();
				}
			}
			return url;
		});

		this.init = function() {
			if (Parse.User.current()) {
				self.loggedIn(true);
			}
		};

		this.toggleFileMenu = function() {
			if (Parse.User.current()) {
				if (self.fileMenuVisible()) {
					self.fileMenuVisible(false);
				} else {
					self.fileMenuVisible(true);
					self.versionMenuVisible(false);
					ko.postbox.publish('version-menu.state', self.versionMenuVisible());
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

		this.toggleVersionMenu = function() {
			if (self.versionMenuVisible()) {
				self.versionMenuVisible(false);
			} else {
				self.versionMenuVisible(true);
				self.fileMenuVisible(false);
				ko.postbox.publish('file-menu.state', self.fileMenuVisible());
			}
			ko.postbox.publish('version-menu.state', self.versionMenuVisible());
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

		this.logout = function() {
			self.loggedIn(false);
			self.fileMenuVisible(false);
			self.viewMenuVisible(false);
		};

		this.openMap = function(map) {
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
		};

		ko.postbox.subscribe('auth.logout', function() {
			self.logout();
		});

		ko.postbox.subscribe('file-info.open-map', function(map) {
			self.openMap(map);
		});

		this.init();

	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	File.prototype.dispose = function() { };

	return { viewModel: File, template: templateMarkup };

});
