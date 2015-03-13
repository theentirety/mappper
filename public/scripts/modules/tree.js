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
				$('#tree span').on('click', function() {
					if ($(this).hasClass('collapsed')) {
						$(this).removeClass('collapsed');
						$(this).children('.ellipsis').remove();
					} else if ($(this).parent().hasClass('has_children')) {
						var parent = $(this);
						parent.addClass('collapsed');
						var ellipsis = document.createElement('div');
						$(ellipsis).addClass('ellipsis');
						if ($(this).attr('data-color')) {
							$(ellipsis).css('background-color', $(this).data('color'));
						}
						parent.append(ellipsis);
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