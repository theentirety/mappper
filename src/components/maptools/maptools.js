define(['knockout', 'text!./maptools.html'], function(ko, templateMarkup) {

  function Maptools(params) {
    this.message = ko.observable('Hello from the maptools component!');
  }

  // This runs when the component is torn down. Put here any logic necessary to clean up,
  // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
  Maptools.prototype.dispose = function() { };
  
  return { viewModel: Maptools, template: templateMarkup };

});
