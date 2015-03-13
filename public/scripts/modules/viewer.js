define(['knockout'], function(ko) {
	return {
		initialize: function() {
			viewer_show = ko.observable(false);
			viewer_isLoading = ko.observable().subscribeTo('isLoading');
			viewer_treeId = ko.observable();
			viewer_treeVersion = ko.observable();
			viewer_showOutline = ko.observable(true);
			viewer_printMode = ko.observable(false);
			viewer_treeTitle = ko.observable('untitled');
			viewer_activeVersionNumber = ko.observable(1);

			viewer_init = function() {
				var treeId = viewer_getQueryVariable('id');
				var treeVersion = viewer_getQueryVariable('v');

				if (treeId && treeVersion) {
					viewer_treeId(treeId);
					viewer_treeVersion(treeVersion);
					viewer_openTree();
				} else {
					alert('This is an invalid link for a shared product map.');
				}
			}

			viewer_openTree = function() {
				Parse.Cloud.run('loadTreeVersion', {
					treeId: viewer_treeId(),
					version: viewer_treeVersion()
				}, {
					success: function(result) {
						if (result) {
							viewer_show(true);
							viewer_treeTitle(result.attributes.tree.attributes.friendly);
							$('#viewer_content').html(result.attributes.data);
							viewer_activeVersionNumber(result.attributes.tree.attributes.numVersions);
							viewer_render();
							ko.postbox.publish('attachTreeBindings');
						} else {
							alert('This link is not a valid map.');
						}
					}, 
					error: function(error) {
						console.log(error)
						alert('There was an error loading the map. Please make sure the map ID ' + viewer_treeId() + ' is valid and refresh the page.');
					}
				});
			}

			viewer_toggleOutline = function() {
				if (viewer_showOutline()) {
					viewer_showOutline(false);
				} else {
					viewer_showOutline(true);
				}
			}

			viewer_render = function() {
				viewer_formatExpandCollapse();
				var data = $('#viewer_content').html();
				viewer_scrub(data);
			}

			viewer_formatExpandCollapse = function() {
				// first convert all of the dots to carets if they have children
				$('#viewer_content li').each(function() {
					$(this).removeClass('has_children');
					if ($(this).next('ol').length > 0) {
						$(this).addClass('has_children');
					} else {
						$(this).removeClass('has_children').removeClass('collapsed');
					}
				});
			}

			viewer_scrub = function(data) {
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
				});
				
				$('.tree-container').html(temp);
			}

			viewer_getQueryVariable = function(variable) {
				var query = window.location.search.substring(1);
				var vars = query.split("&");
				for (var i=0;i<vars.length;i++) {
					var pair = vars[i].split("=");
					if (pair[0] == variable) {
						return pair[1];
					}
				}
				return null;
			}

			viewer_init();
		}
	}
});