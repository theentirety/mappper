define(['knockout'], function(ko) {
	return {
		initialize: function() {

			treenav_sliderValue = ko.observable(100).publishOn('treeScale');
			treenav_printMode = ko.observable(false).syncWith('printMode');
			treenav_shownPrintMsg = false;

			treenav_orientationOptions = ko.observableArray([
				{
					title: 'Square',
					className: 'square',
					icon: 'fa fa-arrow-circle-o-left'
				},{
					title: 'Landscape',
					className: 'landscape',
					icon: 'fa fa-arrow-circle-o-left'
				},{
					title: 'Portrait',
					className: 'portrait',
					icon: 'fa fa-arrow-circle-o-left'
				}
			]);

			treenav_activeOrientation = ko.observable(0);
			treenav_orientation = ko.computed(function() {
				return treenav_orientationOptions()[treenav_activeOrientation()].className;
			}).publishOn('orientation');
			
			treenav_init = function() {
  
			}

			treenav_selectOrientation = function(index) {
				treenav_activeOrientation(index);
			}

			treenav_print = function() {
				if (treenav_printMode()) {
					treenav_printMode(false);
				} else {
					treenav_printMode(true);
					if (!treenav_shownPrintMsg) {
						treenav_shownPrintMsg = true;
						alert('To print, use a screen capture plugin for Chrome like "Awesome Screenshot."');
					}
				}
			}

			treenav_init();
		}
	}
});