define(['knockout'], function(ko) {
	return {
		initialize: function() {
			// auth_signedIn = ko.observable(false).publishOn('signedIn');

			editor_init = function() {

			}

			editor_render = function() {
				var data = $('#editor_content').html();
				editor_scrub(data);
			}

			editor_formatButton = function(item, event) {
				var command = $(event.target).val();
				editor_apply(command);
			}

			editor_apply = function(command) {
				var el = document.getElementById('editor_content');
				var value = null;

				document.designMode = 'on';
				document.execCommand(command, false, value);
				document.designMode = 'off';

				editor_render();
			}

			editor_scrub = function(data) {
				var temp = $(data).clone();

				// first we need to go through and turn all the text into span tags and apply styles
				$(temp).find('li').each(function() { 
					var current = $(this).html();
					var nodeStyle = null;
					if (current.indexOf('<b>') >= 0 || current.indexOf('<strong>') >= 0) {
						nodeStyle = 'dialog';
						current = $(current).text();
					} else if (current.indexOf('<i>') >= 0) {
						nodeStyle = 'component';
						current = $(current).text();
					}
					var span = document.createElement('span');
					$(span).addClass(nodeStyle).text(current);
					$(this).html(span);
				});

				// now we need to embed the ol tags inside the parent li tag
				$(temp).find('ol').each(function() {
					var parent = $(this).prev('li');
					var list = $(this).detach();
					$(parent).append(list);
				});
				
				$('#tree').html(temp);
				ko.postbox.publish('renderTree');
			}

			editor_keyup = function(item, event) {
				var keyCode = event.which;
// console.log(keyCode)
				switch (keyCode) {
					case 192:
						// tilde
						editor_apply('outdent');
						break;
					case 13: 
						// return/enter
						editor_render();
						return true;
						break;
					case 9: 
						// tab
						editor_apply('indent');
						break;
					default: 
						return true;
						break;
				}
				return false;
			}

			editor_init();
		}
	}
});