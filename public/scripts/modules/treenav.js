define(['knockout'], function(ko) {
	return {
		initialize: function() {

			treenav_sliderValue = ko.observable(100).publishOn('treeScale');

			treenav_init = function() {
  
			}

			treenav_init();
		}
	}
});