define(['knockout', 'text!./tree.html', 'knockout-postbox'], function(ko, templateMarkup) {

	function Tree(params) {
		var self = this;

		this.visible = ko.observable(true).publishOn('tree.visibility');
		this.isDirty = ko.observable(false).syncWith('tree.isDirty');
		this.expanded = ko.observable(true).publishOn('tree.expanded');
		this.localStorageAvailable = ko.observable(false);
		// this.selectionTop = ko.observable(0).publishOn('tree.selection-top');

		this.selectionTop = 0;
		this.shiftKeyPressed = false;
		this.draftTimestamp = new Date();
		this.lastEditTimestamp = this.draftTimestamp;

		this.init = function() {
			self.localStorageAvailable(self.checkLocalstorage());
			if (self.localStorageAvailable()) {
				var draft = localStorage.getItem('draft') || '';
				var draftSave = window.setInterval(function() {
					if (self.draftTimestamp != self.lastEditTimestamp) {
						var draftData = $('#tree').html()
						localStorage.setItem('draft', draftData);
						self.draftTimestamp = self.lastEditTimestamp;
						// localStorage.setItem('draftId', self.treeId());
						// localStorage.setItem('draftTitle', self.treeTitle());
					}
				}, 5000);

				if (draft.length > 0) {
					var confirmLoad = confirm('There is an unsaved draft. Do you want to restore it?');
					if (confirmLoad) {
						ko.postbox.publish('loading', true);
						var loader = window.setTimeout(function() {
							$('#tree').html(draft);
							self.scrub(draft);
							ko.postbox.publish('loading', false);
							// self.treeTitle(localStorage.getItem('draftTitle'));
							// self.treeId(localStorage.getItem('draftId'));
							self.isDirty(true);
						}, 1500);
					} else {
						return;
					}
				} else {
					localStorage.setItem('draft', '');
				}
			}

			self.applyBindings();
		}

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

		this.scrub = function(data) {
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
			$(temp).find('ol').each(function() {
				var parent = $(this).prev('li');
				var list = $(this).detach();
				$(parent).append(list);
				if ($(parent).hasClass('has_children')) {
					var childSpan = $(parent).children('span').first();
					childSpan.attr('data-bind', 'tooltip: { text: \'Click to show/hide. Shift-click to show/hide all children.\' }');
					ko.applyBindings(self, $(childSpan)[0]);
				}
			});
			
			$('.tree-container').html(temp);
			ko.postbox.publish('tree.render');
		}

		this.load = function(data) {
			$('#tree').empty();
			$('#tree').html(data);
			self.scrub(data);
			self.applyBindings();
		};

		this.render = function() {
			self.formatExpandCollapse();
			var data = $('#tree').html();
			self.scrub(data);
			self.isDirty(true);
			self.lastEditTimestamp = new Date();
		}

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

			self.render();
		}

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

		this.keyup = function(item, event) {
			var keyCode = event.which;
			switch (keyCode) {
				case 8:
					// delete
					self.formatExpandCollapse();
					return true;
					break;
				case 192:
					// tilde
					self.apply('outdent');
					self.formatExpandCollapse();
					break;
				case 13: 
					// return/enter
					self.formatExpandCollapse();
					self.render();
					return true;
					break;
				case 9: 
					// tab
					self.apply('indent');
					// editor_formatExpandCollapse();
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
		});

		ko.postbox.subscribe('tree.apply', function(options) {
			self.apply(options.tool, options.value);
		});

		this.init();

	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	Tree.prototype.dispose = function() { };

	return { viewModel: Tree, template: templateMarkup };

});
