define(['knockout'], function(ko) {
	return {
		initialize: function() {
			editor_showSwatchPicker = ko.observable(false);
			editor_treeId = ko.observable(null);
			editor_saveMessage = ko.observable('');
			editor_numVersions = ko.observable(0);
			editor_saving = ko.observable(false);
			editor_showLoadingPanel = ko.observable(false);
			editor_trees = ko.observableArray();
			editor_versions = ko.observableArray();

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

			editor_openTree = function(item) {
				Parse.Cloud.run('loadTree', {
					treeId: item.id
				}, {
					success: function(result) {
						$('#editor_content').html(result.attributes.data);
						editor_treeId(result.attributes.tree.id);
						editor_showLoadingPanel(false);
						editor_render();
					}, 
					error: function(error) {
						console.log(error);
					}
				});
			}

			editor_save = function() {
				var currentUser = Parse.User.current();

				if (currentUser) {

					if (editor_treeId() == null) {

						var friendly = prompt('What do you want to call this map?');

						editor_saving(true);
						editor_saveMessage('Saving...');

						// first save - do the tree save, then the version
						Parse.Cloud.run('saveTree', {
							friendly: friendly
						}, {
							success: function(result) {
								editor_treeId(result.id);
								Parse.Cloud.run('saveTreeVersion', {
									treeData: $('#editor_content').html(),
									treeId: result.id
								}, {
									success: function(result) {
										editor_getNumVersions();
									}, 
									error: function(error) {
										console.log(error);
									}
								});
							}, 
							error: function(error) {
								console.log(error);
							}
						});
					} else {
						// existing object - save just the version
						Parse.Cloud.run('saveTreeVersion', {
							treeData: $('#editor_content').html(),
							treeId: editor_treeId()
						}, {
							success: function(result) {
								editor_getNumVersions();
							}, 
							error: function(error) {
								console.log(error);
							}
						});
					}

				} else {
					ko.postbox.publish('signIn');
				}
			}

			editor_toggleLoad = function() {
				if (editor_showLoadingPanel()) {
					editor_showLoadingPanel(false);
				} else {
					editor_showLoadingPanel(true);
					Parse.Cloud.run('getTrees', {}, {
						success: function(result) {
							editor_trees(result);
						}, 
						error: function(error) {
							console.log(error);
						}
					});
				}
			}

			editor_getNumVersions = function() {
				editor_numVersions(editor_numVersions() + 1);
				editor_saving(false);
				editor_saveMessage('Saved (' + editor_numVersions() + ')');
				$('#editor_save_message').transition({
					opacity: 0
				}, 3000, function() {
					editor_saveMessage('');
					$(this).css('opacity', 1);
				})
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
						var underlined = $(this).find('u').get(0);

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