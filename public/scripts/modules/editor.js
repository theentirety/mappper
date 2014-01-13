define(['knockout'], function(ko) {
	return {
		initialize: function() {
			// auth_signedIn = ko.observable(false).publishOn('signedIn');
			editor_showSwatchPicker = ko.observable(false);
			editor_colors = ko.observableArray([
				{ color: '#000' },
				{ color: 'yellow' },
				{ color: 'blue' },
				{ color: 'pink' },
				{ color: 'green' },
			]);

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

			editor_apply = function(command, value) {
				var el = document.getElementById('editor_content');
				var value = value || null;

				document.designMode = 'on';

				if (command == 'normal' || command == 'bold' || command == 'italic') {
					if (document.queryCommandState('bold')) {
						document.execCommand('bold', false, value); // remove bold (modal)
					}
					if (document.queryCommandState('italic')) {
						document.execCommand('italic', false, value); // remove italic (component)
					}
				}

				document.execCommand(command, false, value);
				document.designMode = 'off';

				editor_render();
			}

			editor_scrub = function(data) {
				var temp = $(data).clone();

				// first we need to go through and turn all the text into span tags and apply styles
				$(temp).find('li').each(function() {
					if ($(this).text() == '') {
						$(this).remove();
					} else {
						var current = $(this).text();
						var font = $(this).find('font').get(0);
						var bold = $(this).find('b,strong').get(0);
						var italic = $(this).find('i,em').get(0);

						var nodeStyle = null;
						var span = document.createElement('span');

						// apply a color if added
						if (font) {
							color = $(font).attr('color');
							$(span).attr('style', 'border-color:'+color);
						}

						// add the dialog class
						if (bold) {
							nodeStyle = 'dialog';
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
				$(temp).find('ol').each(function() {
					var parent = $(this).prev('li');
					var list = $(this).detach();
					$(parent).append(list);
				});
				
				$('#tree').html(temp);
				ko.postbox.publish('renderTree');
			}

			editor_toggleSwatches = function() {
				if (editor_showSwatchPicker()) {
					editor_showSwatchPicker(false);
				} else {
					editor_showSwatchPicker(true);
				}
			}

			editor_selectColor = function(item) {
				editor_apply('foreColor', item.color)
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