define(['knockout'], function(ko) {
	return {
		initialize: function() {
			editor_showSwatchPicker = ko.observable(false);
			editor_treeId = ko.observable(null);
			editor_numVersions = ko.observable(0);
			editor_showMessage = ko.observable(false);
			editor_message = ko.observable();
			editor_showLoadingPanel = ko.observable(false);
			editor_trees = ko.observableArray();
			editor_versions = ko.observableArray();
			editor_showVersions = ko.observable(false);
			editor_treeTitle = ko.observable('(untitled)');
			editor_loadTreeMessage = ko.observable('Loading...');
			editor_showHierarchy = ko.observable(true);
			editor_activeVersionTree = ko.observable('');
			editor_activeVersion = ko.observable('');
			editor_activeVersionNumber = ko.observable(-1);
			editor_isDirty = ko.observable(false);

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
				editor_isDirty(true);
			}

			editor_formatButton = function(item, event) {
				var command = $(event.target).val();
				editor_apply(command);
			}

			editor_confirmDiscard = function(callback) {
				if (editor_isDirty()) {
					var confirmOpen = confirm('This map has unsaved changes. Are you sure you wish to open this map and lose the previous changes?');
					if (confirmOpen == true) {
						editor_message('Loading...');
						editor_showMessage(true);
						callback();
					}
				} else {
					editor_message('Loading...');
					editor_showMessage(true);
					callback();
				}
			}

			editor_openTree = function(item) {
				editor_confirmDiscard(function() {
					Parse.Cloud.run('loadTree', {
						treeId: item.id
					}, {
						success: function(result) {
							editor_completeOpen(result);
							editor_activeVersionNumber(0)
							editor_versions([]);
							editor_showVersions(false);
							editor_activeVersionTree('');
						}, 
						error: function(error) {
							console.log(error);
						}
					});
				});
			}

			editor_openVersion = function(item, event) {
				editor_confirmDiscard(function() {
					editor_activeVersion(item.id);
					editor_activeVersionNumber(parseInt($(event.target).attr('data-version')));
					Parse.Cloud.run('loadTree', {
						treeId: item.attributes.tree.id,
						version: item.id
					}, {
						success: function(result) {
							editor_completeOpen(result);
						}, 
						error: function(error) {
							console.log(error);
						}
					});
				});
			
			}

			editor_completeOpen = function(result) {
				editor_treeTitle(result.attributes.tree.attributes.friendly);
				$('#editor_content').html(result.attributes.data);
				editor_treeId(result.attributes.tree.id);
				editor_showLoadingPanel(false);
				editor_activeVersionTree(result.attributes.tree.id);
				editor_activeVersion(result.id);
				editor_render();
				editor_isDirty(false);
				editor_showMessage(false);
				editor_message('');
			}

			editor_save = function() {
				var currentUser = Parse.User.current();

				if (currentUser) {

					if (editor_treeId() == null) {

						var friendly = prompt('What do you want to call this map?');

						editor_showMessage(true);
						editor_message('Saving...');

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
										editor_completeSave(result);
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
						editor_showMessage(true);
						editor_message('Saving...');
						// existing object - save just the version
						Parse.Cloud.run('saveTreeVersion', {
							treeData: $('#editor_content').html(),
							treeId: editor_treeId()
						}, {
							success: function(result) {
								editor_completeSave(result);
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
				var currentUser = Parse.User.current();
				if (currentUser) {
					if (editor_showLoadingPanel()) {
						editor_showLoadingPanel(false);
						editor_loadTreeMessage('Loading...');
						editor_activeVersionTree(null);
						editor_showVersions(false);
						editor_versions([]);
					} else {
						editor_showLoadingPanel(true);
						Parse.Cloud.run('getTrees', {}, {
							success: function(result) {
								editor_trees(result);
								if (result.length <= 0) {
									editor_loadTreeMessage('No saved maps.');
								}
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

			editor_toggleHierarchy = function() {
				if (editor_showHierarchy()) {
					editor_showHierarchy(false);
				} else {
					editor_showHierarchy(true);
				}
			}

			editor_completeSave = function(result) {
				editor_isDirty(false);
				editor_showVersions(false);
				editor_activeVersion(result.id);
				editor_activeVersionNumber(editor_numVersions() + 1);
				editor_showMessage(false);
				editor_message('');
				editor_activeVersionNumber(0);
			}

			editor_loadVersions = function(item) {
				editor_showVersions(true);
				editor_activeVersionTree(item.id);

				var treeId = item.id;
				Parse.Cloud.run('getTreeVersions', {
					treeId: treeId
				}, {
					success: function(result) {
						editor_versions(result);
						editor_numVersions(result.length);
					}, 
					error: function(error) {
						console.log(error);
					}
				});
			}

			editor_apply = function(command, value) {
				var el = document.getElementById('editor_content');
				var value = value || null;

				document.designMode = 'on';

				if (command == 'normal' || command == 'bold' || command == 'italic' || command == 'underline') {
					if (document.queryCommandState('bold')) {
						document.execCommand('bold', false, value); // remove bold (modal)
					}
					if (document.queryCommandState('italic')) {
						document.execCommand('italic', false, value); // remove italic (component)
					}
					if (document.queryCommandState('underline')) {
						document.execCommand('underline', false, value); // remove underline (stacked)
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