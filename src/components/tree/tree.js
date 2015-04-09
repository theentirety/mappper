define(['knockout', 'text!./tree.html', 'hasher', 'knockout-postbox'], function(ko, templateMarkup, hasher) {

	function Tree(params) {
		var self = this;

		this.visible = ko.observable(true).publishOn('tree.visibility');
		this.isDirty = ko.observable(false).syncWith('tree.isDirty');
		this.expanded = ko.observable(true).publishOn('tree.expanded');
		this.treeTitle = ko.observable('(untitled)').syncWith('file.map-title');
		this.treeId = ko.observable().syncWith('file.map-id');
		this.localStorageAvailable = ko.observable(false);

		this.selectionTop = 0;
		this.shiftKeyPressed = false;

		this.init = function() {
			self.localStorageAvailable(self.checkLocalstorage());
			if (self.localStorageAvailable()) {
				var draft = localStorage.getItem('draft') || '';
				var currentPage = hasher.getHash();
				if (draft.length > 0 && (currentPage == 'editor' || currentPage == '')) {
					var confirmLoad = confirm('There is an unsaved draft. Do you want to restore it?');
					if (confirmLoad) {
						self.loadDraft(draft);
					} else {
						ko.postbox.publish('loading', false);
						return;
					}
				} else if (draft.length > 0 && (currentPage == 'sign-in' || currentPage == 'forgot-password')) {
					self.loadDraft(draft);
				} else {
					ko.postbox.publish('loading', false);
				}
			}

			self.applySelectionBindings();
			self.applyBindings();
		};

		this.loadDraft = function(draft) {
			ko.postbox.publish('loading', true);
			var loader = window.setTimeout(function() {
				self.isDirty(true);
				self.treeTitle(localStorage.getItem('draftTitle') || '(untitled)');
				self.treeId(localStorage.getItem('draftId'));
				self.load(draft);
				ko.postbox.publish('loading', false);
			}, 1500);
		};

		this.applySelectionBindings = function() {
			$(document).on('selectionchange', function() {
				var selection = this.getSelection();
				if (selection.anchorNode) {
					var treeOffset = $('#tree').offset();
					var selectionOffset = $(selection.anchorNode.parentElement).offset();
					var position = selectionOffset.top - treeOffset.top;
					if (self.selectionTop != position) {
						ko.postbox.publish('tree.selection-top', position);
					}
				} else {
					ko.postbox.publish('tree.selection-top', -1);
				}
			});
		};

		this.applyBindings = function() {
			// listen for clicks on the nodes
			$('#tree').on('click', 'li', function(event) {
				if (event.offsetX < 0 && $(event.target).hasClass('has_children')) {
					var toggleTo = 'expanded';
					if ($(event.target).hasClass('collapsed')) {
						$(event.target).removeClass('collapsed');
					} else {
						$(event.target).addClass('collapsed');
						toggleTo = 'collapsed';
					}

					if (event.shiftKey) {
						if (window.getSelection) {
							if (window.getSelection().empty) {  // Chrome
								window.getSelection().empty();
							} else if (window.getSelection().removeAllRanges) {  // Firefox
							window.getSelection().removeAllRanges();
							}
						} else if (document.selection) {  // IE?
							document.selection.empty();
						}
						var children = $(event.target).next('ol').find('.has_children');
						$(children).each(function() {
							if (toggleTo == 'collapsed') {
								$(this).addClass('collapsed');
							} else {
								$(this).removeClass('collapsed');
							}
						});
					}
				}
			});
		};

		this.load = function(data) {
			$('#tree').empty();
			$('#tree').html(data);
			ko.postbox.publish('map.render', JSON.stringify(data));
			self.formatExpandCollapse();
		};

		this.reload = function() {
			self.isDirty(true);
			var data = $('#tree').html();
			ko.postbox.publish('map.render', JSON.stringify(data));
			self.formatExpandCollapse();
			self.saveDraft();
		};

		this.formatExpandCollapse = function() {
			// first convert all of the dots to carets if they have children
			$('#tree li').each(function() {
				$(this).removeClass('has_children');
				if ($(this).next('ol').length > 0) {
					$(this).addClass('has_children');
				} else {
					$(this).removeClass('has_children').removeClass('collapsed');
				}
			});
		}

		this.saveDraft = function() {
			var draftData = $('#tree').html()
			localStorage.setItem('draft', draftData);
			localStorage.setItem('draftId', self.treeId());
			localStorage.setItem('draftTitle', self.treeTitle());
		};

		this.apply = function(tool, value) {
			var el = document.getElementById('tree');
			var value = value || null;

			document.designMode = 'on';

			if (tool == 'normal' || tool == 'bold' || tool == 'italic' || tool == 'underline') {
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

			document.execCommand(tool, false, value);
			document.designMode = 'off';

			self.reload();
		}


		this.resetDraft = function() {
			localStorage.setItem('draft', '');
		}

		this.keyup = function(item, event) {
			var keyCode = event.which;

			switch (keyCode) {
				case 8:
					// delete
					self.reload();
					return true;
					break;
				case 13: 
					// return/enter
					self.reload();
					return true;
					break;
				case 9: 
					// tab
					if (event.shiftKey) {
						self.apply('outdent');
					} else {
						self.apply('indent');
					}
					self.reload();
					return true;
					break;
				case 65: 
					// ctrl + shift + a = stacked pages
					if (event.shiftKey && event.ctrlKey) {
						self.apply('underline');
					}
					return true;
					break;
				case 67: 
					// ctrl + shift + c = component
					if (event.shiftKey && event.ctrlKey) {
						self.apply('italic');
					}
					return true;
					break;
				case 68: 
					// ctrl + shift + d = page
					if (event.shiftKey && event.ctrlKey) {
						self.apply('normal');
					}
					return true;
					break;
				case 77: 
					// ctrl + shift + m = modal
					if (event.shiftKey && event.ctrlKey) {
						self.apply('bold');
					}
					return true;
					break;
				default: 
					return true;
					break;
			}
			return false;
		}

		this.toggleWidth = function() {
			if (self.expanded()) {
				self.expanded(false);
				var selection = window.getSelection();
				selection.removeAllRanges();
			} else {
				self.expanded(true);
			}
		};

		this.checkLocalstorage = function() {
			try {
				return 'localStorage' in window && window['localStorage'] !== null;
			} catch (e) {
				return false;
			}
		}

		this.lightenColor = function(color, percent) {  
			var num = parseInt(color.slice(1),16), amt = Math.round(2.55 * percent), R = (num >> 16) + amt, G = (num >> 8 & 0x00FF) + amt, B = (num & 0x0000FF) + amt;
			return "#" + (0x1000000 + (R<255?R<1?0:R:255)*0x10000 + (G<255?G<1?0:G:255)*0x100 + (B<255?B<1?0:B:255)).toString(16).slice(1);
		}

		ko.postbox.subscribe('tree.load', function(data) {
			self.load(data);
			self.resetDraft();
		});

		ko.postbox.subscribe('tree.apply', function(options) {
			self.apply(options.tool, options.value);
		});

		ko.postbox.subscribe('map.save', function(options) {
			self.resetDraft();
		});

		this.init();

	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	Tree.prototype.dispose = function() { };

	return { viewModel: Tree, template: templateMarkup };

});
