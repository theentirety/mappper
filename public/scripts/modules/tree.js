define(['knockout'], function(ko) {
	return {
		initialize: function() {
			tree_scale = ko.observable(1);
			tree_orientation = ko.observable('square').subscribeTo('orientation');

			ko.postbox.subscribe('renderTree', function() {
				tree_attachBindings();
			});

			ko.postbox.subscribe('treeScale', function(value) {
				tree_scale(value / 100);

				$('#tree').transition({
					scale: tree_scale()
				}, 0)
			});

			ko.postbox.subscribe('attachTreeBindings', function() {
				tree_attachBindings();
			});

			tree_init = function() {
				debiki.Utterscroll.enable({
					// scrollstoppers: '.CodeMirror, .ui-resizable-handle'
				});
			}

			tree_attachBindings = function() {
				$('#tree span').on('click', function(event) {
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
								var parent = $(this).parent('li');
								if ($(parent).attr('data-color')) {
									$(ellipsis).css('background-color', $(parent).data('color'));
								}
								$(this).append(ellipsis);
							} else {
								$(this).removeClass('collapsed');
							}
						});
					}

				});
			}

			tree_expandCollapse = function() {
				console.log('expand/collapse')
			}

			tree_init();
		}
	}
});