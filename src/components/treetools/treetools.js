define(['knockout', 'text!./treetools.html'], function(ko, templateMarkup) {

  function Treetools(params) {
    this.message = ko.observable('Hello from the treetools component!');
  }

  // This runs when the component is torn down. Put here any logic necessary to clean up,
  // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
  Treetools.prototype.dispose = function() { };
  
  return { viewModel: Treetools, template: templateMarkup };

});
