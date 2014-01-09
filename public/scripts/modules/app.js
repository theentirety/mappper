define(['knockout'], function(ko) {
	return function(App) {
		var self = this;

		self.main_lightboxed = ko.observable().subscribeTo('isLightboxed');
	};
});
