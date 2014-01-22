define(['knockout'], function(ko) {
	return {
		initialize: function() {
			tree_scale = ko.observable(1);

			ko.postbox.subscribe('renderTree', function() {
				tree_attachBindings();
			});

			ko.postbox.subscribe('treeScale', function(value) {
				tree_scale(value / 100);

				$('#tree').transition({
					scale: tree_scale()
				}, 0)
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
					} else {
						$(this).addClass('collapsed');
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