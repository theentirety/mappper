define(['knockout', 'text!./map.html', 'debeki', 'knockout-postbox'], function(ko, templateMarkup, debeki) {

	function Map(params) {
		var self = this;

		// observables
		this.scale = ko.observable(1);
		this.orientation = ko.observable('square').subscribeTo('maptools.orientation');
		this.treeExpanded = ko.observable(true).subscribeTo('tree.expanded');
		this.dragging = false;
		this.curYPos = 0;
		this.curXPos = 0;

			// subscriptions
		ko.postbox.subscribe('tree.render', function() {
			self.attachBindings();
		});

		ko.postbox.subscribe('maptools.scale', function(value) {
			self.scale(value / 100);

			// NEED TO REWRITE WItHOUT TRANSIT
			// $('#tree').transition({
			// 	scale: tree_scale()
			// }, 0)
		});

		// private functions
		this.init = function() {
			self.attachBindings();
			debiki.Utterscroll.enable({
				scrollstoppers: 'tree'
			});
		};

		this.attachBindings = function() {
			$('#map span').on('click', function(event) {
				var toggleTo = 'expanded';
				if ($(event.target).hasClass('collapsed')) {
					$(event.target).removeClass('collapsed');
					$(event.target).children('.ellipsis').remove();
				} else if ($(event.target).parent().hasClass('has_children')) {
					var parent = $(event.target);
					parent.addClass('collapsed');
					toggleTo = 'collapsed';
					var ellipsis = document.createElement('div');
					$(ellipsis).addClass('ellipsis');
					if ($(event.target).attr('data-color')) {
						$(ellipsis).css('background-color', $(event.target).data('color'));
					}
					parent.append(ellipsis);
				}

				if (event.shiftKey) {
					var children = $(event.target).next('ol').find('.has_children>span');
					$(children).each(function() {
						if (toggleTo == 'collapsed') {
							$(this).addClass('collapsed');
							var ellipsis = document.createElement('div');
							$(ellipsis).addClass('ellipsis');
							if ($(this).attr('data-color')) {
								$(ellipsis).css('background-color', $(this).data('color'));
							}
							$(this).append(ellipsis);
						} else {
							$(this).removeClass('collapsed');
						}
					});
				}
			});
		}

		this.init();
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	Map.prototype.dispose = function() { };

	return { viewModel: Map, template: templateMarkup };

});
