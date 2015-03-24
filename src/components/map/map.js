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
		this.scale = ko.observable(1);

		// subscriptions
		ko.postbox.subscribe('map.render', function(data) {
			var data = JSON.parse(data);
			var temp = $(data).clone();

			self.render(temp);
		});

		ko.postbox.subscribe('view-menu.zoom-in', function() {
			self.zoom(1);
		});

		ko.postbox.subscribe('view-menu.zoom-out', function() {
			self.zoom(-1);
		});

		ko.postbox.subscribe('view-menu.orientation', function(orientation) {
			self.setOrientation(orientation);
		});

		// private functions
		this.init = function() {
			debiki.Utterscroll.enable({
				scrollstoppers: 'tree, file-info'
			});
		};

		this.setOrientation = function(orientation) {
			self.orientation(orientation);
		};

		this.zoom = function(direction) {
			var currentScale = self.scale();
			self.scale(currentScale + (direction / 10));
			$('#map').css('transform', 'scale(' + self.scale() + ')');
		};

		this.render = function(data) {

			// first we need to go through and turn all the text into span tags and apply styles
			$(data).find('li').each(function() {
				if ($(this).text() == '') {
					$(this).remove();
				} else {
					var current = $(this).text();
					var font = $(this).find('font').get(0);
					var bold = $(this).find('b,strong').get(0);
					var italic = $(this).find('i,em').get(0);
					var underlined = $(this).find('u').get(0);

					var nodeStyle = null;
					var span = document.createElement('span');

					// apply a color if added
					if (font) {
						color = $(font).attr('color');
						$(span).attr('style', 'border-color:'+color);
						$(span).attr('style', 'background-color:'+color);//self.lightenColor(color, 40));
						$(span).attr('data-color', color);
					}

					// add the dialog class
					if (bold) {
						nodeStyle = 'dialog';
					} 

					// add the dialog class
					if (underlined) {
						nodeStyle = 'stacked';
					} 

					// add the component class
					if (italic) {
						nodeStyle = 'component';
					}
					
					$(span).addClass(nodeStyle).text(current);
					$(this).html(span);
				}
			});

			// now we need to embed the ol tags inside the parent li tag
			$(data).find('ol').each(function() {
				var parent = $(this).prev('li');
				var list = $(this).detach();
				$(parent).append(list);
				if ($(parent).hasClass('has_children')) {
					var childSpan = $(parent).children('span').first();
					childSpan.attr('data-bind', 'tooltip: { text: \'Click to show/hide. Shift-click to show/hide all children.\' }');
					ko.applyBindings(self, $(childSpan)[0]);
				}
			});

			$('#map').html(data);
			self.attachBindings();
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
			// var element = document.getElementById('map');
			// ko.cleanNode(element);
			// ko.applyBindingsToNode(element, null, self);
		}

		this.init();
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	Map.prototype.dispose = function() { };

	return { viewModel: Map, template: templateMarkup };

});
