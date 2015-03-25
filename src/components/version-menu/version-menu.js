define(['knockout', 'text!./version-menu.html', 'knockout-postbox'], function(ko, templateMarkup) {

	function VersionMenu(params) {
		var self = this;

		this.visible = ko.observable(false).syncWith('file-info.version-menu-visible');
		this.numVersions = ko.observable(0);
		this.versions = ko.observableArray();
		this.dirtyMap = ko.observable().syncWith('tree.isDirty');

		this.init = function() {
			self.setup();
		};

		this.setup = function() {
			self.versions([]);
			for (var i = self.numVersions(); i > 0; i--) {
				self.versions.push(new self.Version({ number: i }));
			}
		};

		this.Version = function(params) {
			var newVersion = {};
			newVersion.number = params.number;
			return newVersion
		};

		this.openVersion = function(item) {
			self.visible(false);
			var openMap = true;

			if (self.dirtyMap()) {
				var confirmOpen = confirm('The current map has unsaved changes. Are you sure you wish to open this version and lose the previous changes?');
				if (confirmOpen == false) {
					openMap = false;
				}
			}

			if (openMap) {
				console.log('open map')
				// ko.postbox.publish('file-info.open-map', {
				// 	id: item.id,
				// 	friendly: item.attributes.friendly,
				// 	numVersions: item.attributes.numVersions
				// });
			}
		};

		ko.postbox.subscribe('file-info.num-versions', function(numVersions) {
			self.numVersions(numVersions);
			self.setup();
		});

		this.init();

	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	VersionMenu.prototype.dispose = function() { };

	return { viewModel: VersionMenu, template: templateMarkup };

});