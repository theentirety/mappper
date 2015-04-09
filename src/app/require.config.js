// require.js looks for the following global when initializing
var require = {
    baseUrl: ".",
    paths: {
        "bootstrap":            "bower_modules/components-bootstrap/js/bootstrap.min",
        "crossroads":           "bower_modules/crossroads/dist/crossroads.min",
        "hasher":               "bower_modules/hasher/dist/js/hasher.min",
        "jquery":               "bower_modules/jquery/dist/jquery",
        "knockout":             "bower_modules/knockout/dist/knockout",
        "knockout-projections": "bower_modules/knockout-projections/dist/knockout-projections",
        "knockout-postbox":     "bower_modules/knockout-postbox/build/knockout-postbox.min",
        "signals":              "bower_modules/js-signals/dist/signals.min",
        "text":                 "bower_modules/requirejs-text/text",
        "parse":                "bower_modules/parse/parse.min",
        "async-load":           "bower_modules/async-load/load.min",
        "dom-class":            "bower_modules/dom-class/class.min",
        "debeki":               "vendor/debiki-utterscroll"
    },
    shim: {
        "knockout": { deps: ["jquery"] },
        "jquery": { export: '$' },
        "parse": { export: 'Parse' },
        "debeki": { deps: ["jquery"], export: 'debeki' },
        "knockout-postbox": { deps: ["knockout"] },
        "knockout-projections": { deps: ["knockout"] },
    }
};
