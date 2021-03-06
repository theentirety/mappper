define(['knockout', 'text!./treetools.html', 'knockout-postbox'], function(ko, templateMarkup) {

	function Treetools(params) {
		var self = this;

		this.topPosition = ko.observable(0);
		this.visible = ko.observable(false);
		this.menuVisible = ko.observable(false);

		this.swatch = ko.observableArray([
			{ color: '#000000' },
			// { color: '#c462b8' }, // purple
			{ color: '#88beeb' }, // blue
			{ color: '#8bc0a6' }, // dark green
			{ color: '#bfd84b' }, // light green
			{ color: '#f1c12f' }, // yellow
			{ color: '#f68c3d' }, // orange
			{ color: '#fc6a6a' } //pink
		]);

		this.applyColor = function(item, event) {
			var color = $(event.target).attr('data-color');
			ko.postbox.publish('tree.apply', {
				tool: 'foreColor',
				value: color
			});
		};

		this.applyTool = function(item, event) {
			var tool = $(event.target).attr('data-tool');
			ko.postbox.publish('tree.apply', {
				tool: tool
			});
		}

		this.showMenu = function() {
			self.menuVisible(true);
		};

		this.hideMenu = function() {
			self.menuVisible(false);
		};

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
