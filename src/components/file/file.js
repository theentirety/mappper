define(['knockout', 'text!./file.html'], function(ko, templateMarkup) {

  function File(params) {
    this.message = ko.observable('Hello from the file component!');
  }

  // This runs when the component is torn down. Put here any logic necessary to clean up,
  // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
  File.prototype.dispose = function() { };
  
  return { viewModel: File, template: templateMarkup };

});
