require.config({
	waitSeconds : 45,
	shim: {
		facebook: {
			export: 'FB'
		},
		transit: {
			deps: ['jquery'],
			export: '$'
		},
		scrollable: {
			deps: ['jquery']
		},
		utterscroll: {
			deps: ['jquery'],
			export: 'debiki'
		},
		jquery: {
			export: '$'
		},
		moment: {
			export: 'moment'
		},
		ga: {
			export: 'ga'
		},
		underscore: {
			export: '_'
		},
		offline: {
			export: 'offline'
		}
	},
	noGlobal: true,
	paths: {
		'parse': 'lib/parse-1.2.15.min',
		'jquery': 'lib/jquery-2.0.3.min',
		'knockout': 'lib/knockout-3.0.0',
		'fonts': 'lib/webfont',
		'transit': 'lib/jquery.transit.min',
		'facebook': '//connect.facebook.net/en_US/all',
		'knockout-amd-helpers': 'lib/knockout-amd-helpers.min',
		'text': 'lib/text',
		'postbox': 'lib/knockout-postbox.min',
		'moment': 'lib/moment.min',
		'underscore': 'lib/underscore-min',
		'ga': '//www.google-analytics.com/analytics',
		'offline': 'lib/offline.min',
		'scrollable': 'lib/jquery-scrollable',
		'utterscroll': 'lib/debiki-utterscroll'
	}
});

require(['parse', 'fonts', 'knockout', 'modules/app', 'ga', 'offline', 'moment', 'jquery', 'transit', 'knockout-amd-helpers', 'text', 'postbox', 'underscore', 'scrollable', 'utterscroll'], function(parse, fonts, ko, App, ga) {

	// init parse cloud code
	Parse.initialize("mU8MunZaCCU1aB6P9TnEofdM7kfpcLQsq9SPL8HZ", "PtfvEhSrFEERHGoKMi2BIfYcVy16aS9XG9j2BLRd");

	// init and load the third-party fonts
	WebFont.load({
		typekit: { id: 'aym5xdc' }
	});

	ko.bindingHandlers.module.baseDir = 'modules';
	ko.amdTemplateEngine.defaultPath = '/templates';

	var productMap = new App();

	setTimeout(function() {
		ko.applyBindings(productMap);
	}, 0);

	// window.facebookId = '642359842450443';
	// Parse.FacebookUtils.init({
	// 	appId: facebookId,
	// 	cookie: true,   // enable cookies to allow the server to access the session
	// 	xfbml: true,    // parse page for xfbml or html5 social plugins like login button below
	// 	channelUrl: '//nghtclub.com/channel.html',
	// });

	// window.gaTrackingCode = 'UA-44213000-3';

	// // Google Analytics Opt Out Code
	// var disableStr = 'ga-disable-' + gaTrackingCode;
	// if (document.cookie.indexOf(disableStr + '=true') > -1) {
	//   window[disableStr] = true;
	// }

	// window.ga('create', gaTrackingCode, 'parseapp.com');
	// window.ga('send', 'pageview');

});