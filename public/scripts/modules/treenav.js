define(['knockout'], function(ko) {
	return {
		initialize: function() {

			treenav_sliderValue = ko.observable(100).publishOn('treeScale');
			treenav_printMode = ko.observable(false).syncWith('printMode');
			treenav_shownPrintMsg = false;

			treenav_init = function() {
  
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