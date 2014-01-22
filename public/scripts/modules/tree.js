define(['knockout'], function(ko) {
	return {
		initialize: function() {
			// auth_signedIn = ko.observable(false).publishOn('signedIn');

			ko.postbox.subscribe('renderTree', function() {
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