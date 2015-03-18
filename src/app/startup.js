define(['jquery', 'knockout', './router', 'parse', 'typekit', 'utterscroll', 'knockout-postbox', 'knockout-projections'], function($, ko, router, parse, typekit) {

  // Components can be packaged as AMD modules, such as the following:
  ko.components.register('editor', { require: 'components/editor/editor' });

  // ... or for template-only components, you can just point to a .html file directly:
  // ko.components.register('about-page', {
  //   template: { require: 'text!components/about-page/about.html' }
  // });

  ko.components.register('map', { require: 'components/map/map' });
  ko.components.register('tree', { require: 'components/tree/tree' });
  ko.components.register('maptools', { require: 'components/maptools/maptools' });
  ko.components.register('file', { require: 'components/file/file' });
  ko.components.register('treetools', { require: 'components/treetools/treetools' });
  ko.components.register('modal', { require: 'components/modal/modal' });
  ko.components.register('sign-in', { require: 'components/sign-in/sign-in' });
  ko.components.register('sign-up', { require: 'components/sign-up/sign-up' });
  ko.components.register('forgot-password', { require: 'components/forgot-password/forgot-password' });
  ko.components.register('loading', { require: 'components/loading/loading' });

  ko.components.register('auth', { require: 'components/auth/auth' });

  // [Scaffolded component registrations will be inserted here. To retain this feature, don't remove this comment.]

  // init parse cloud code
  // Parse.initialize("mU8MunZaCCU1aB6P9TnEofdM7kfpcLQsq9SPL8HZ", "PtfvEhSrFEERHGoKMi2BIfYcVy16aS9XG9j2BLRd"); // PROD
  Parse.initialize("M0AFadRVcLDPFR9uZdZTI9JChrt3tiZuTSAMySEp", "wJXXCJLiA0ZoPUy6YvaongGhATaogfn7XsqiPoBO"); // DEV

  // init and load the third-party fonts
  typekit('xje1sem');

  // Start the application
  ko.applyBindings({ route: router.currentRoute });
});
