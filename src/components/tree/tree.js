define(['knockout', 'text!./tree.html'], function(ko, templateMarkup) {

  function Tree(params) {
    this.message = ko.observable('Hello from the tree component!');
  }

  // This runs when the component is torn down. Put here any logic necessary to clean up,
  // for example cancelling setTimeouts or disposing Knockout subscriptions/computeds.
  Tree.prototype.dispose = function() { };
  
  return { viewModel: Tree, template: templateMarkup };

});
