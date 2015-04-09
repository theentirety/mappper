define(['knockout', 'text!./tooltip.html', 'knockout-postbox'], function(ko, templateMarkup) {

	ko.bindingHandlers.tooltip = {
		init: function(element, valueAccessor) {
			var value = ko.unwrap(valueAccessor()); // Get the current value of the current property we're bound to
			$(element).on('mouseover', function() {
				ko.postbox.publish('tooltip.show', {
					text: value.text,
					left: $(element).offset().left,
					top: $(element).offset().top
				});
			});

			$(element).on('mouseout', function() {
				ko.postbox.publish('tooltip.hide');
			});
		// $(element).toggle(value); // jQuery will hide/show the element depending on whether "value" or true or false
		},
		update: function(element, valueAccessor, allBindings) {
			// Leave as before
		}
	};

	function Tooltip(params) {
		var self = this;

		this.visible = ko.observable(false);
		this.text = ko.observable();
		this.top = ko.observable(0);
		this.left = ko.observable(0);

		ko.postbox.subscribe('tooltip.show', function(options) {
			self.text(options.text);
			self.top(options.top - 35);
			self.left(options.left - 7);
			self.visible(true);
		});

		ko.postbox.subscribe('tooltip.hide', function() {
			self.visible(false);
			self.text(null);
			self.top(0);
			self.left(0);
		});
	}

	// This runs when the component is torn down. Put here any logic necessary to clean up,
	// for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
	Tooltip.prototype.dispose = function() { };

	return { viewModel: Tooltip, template: templateMarkup };

});
