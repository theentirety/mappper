Parse.Cloud.define('saveTree', function(request, response) {
	var currentUser = Parse.User.current();
	var friendly = request.params.friendly || null;

	if (currentUser) {

		var Tree = Parse.Object.extend('Tree');
		tree = new Tree();

		tree.set('creator', {
			__type: 'Pointer',
			className: '_User',
			objectId: currentUser.id
		});

		tree.set('archived', false);
		tree.set('friendly', friendly);

		tree.save(null, {
			success: function(result) {
				response.success(result);
			}, 
			error: function(error) {
				response.error(error);
			}
		});
	} else {
		response.error('User not logged in.');
	}
});

Parse.Cloud.define('getTrees', function(request, response) {
	var currentUser = Parse.User.current();
	
	if (currentUser) {

		var query = new Parse.Query('Tree');

		query.equalTo('creator', {
			__type: 'Pointer',
			className: '_User',
			objectId: currentUser.id
		});

		query.descending('versionUpdatedAt');
		query.equalTo('archived', false);

		query.find({
			success: function(result) {
				response.success(result);
			},
			error: function(error) {
				response.error(error);
			}
		});
	} else {
		response.error('No saved maps.');
	}
});

Parse.Cloud.define('getTreeVersions', function(request, response) {
	var currentUser = Parse.User.current();
	var treeId = request.params.treeId || null;
	
	if (currentUser && treeId) {

		var query = new Parse.Query('TreeVersion');

		query.equalTo('tree', {
			__type: 'Pointer',
			className: 'Tree',
			objectId: treeId
		});

		query.descending('createdAt');

		query.find({
			success: function(result) {
				response.success(result);
			},
			error: function(error) {
				response.error(error);
			}
		});
	} else {
		response.error('No saved versions.');
	}
});

Parse.Cloud.define('loadTree', function(request, response) {
	var currentUser = Parse.User.current();
	var version = request.params.version || null;
	var treeId = request.params.treeId || null;
	
	if (currentUser) {

		var query = new Parse.Query('TreeVersion');

		query.equalTo('tree', {
			__type: 'Pointer',
			className: 'Tree',
			objectId: request.params.treeId
		});

		query.descending('createdAt');
		query.include('tree');

		if (version) {
			query.equalTo('objectId', version);
		}

		query.first({
			success: function(result) {
				response.success(result);
			},
			error: function(error) {
				response.error(error);
			}
		});
	} else {
		response.error('No saved maps.');
	}
});

Parse.Cloud.define('loadTreeVersion', function(request, response) {
	var version = request.params.version || null;
	var treeId = request.params.treeId || null;

	if (treeId) {

		var query = new Parse.Query('TreeVersion');

		query.equalTo('tree', {
			__type: 'Pointer',
			className: 'Tree',
			objectId: treeId
		});

		if (version) {
			query.equalTo('objectId', version);
		}
		query.descending('createdAt');
		query.include('tree');

		query.first({
			success: function(result) {
				response.success(result);
			},
			error: function(error) {
				response.error(error);
			}
		});
	} else {
		response.error('Missing tree parameters.');
	}
});

Parse.Cloud.define('saveTreeVersion', function(request, response) {
	var currentUser = Parse.User.current();
	var treeId = request.params.treeId || null;
	var treeData = request.params.treeData || null;
	
	if (currentUser && treeId && treeData) {

		var TreeVersion = Parse.Object.extend('TreeVersion');
		version = new TreeVersion();

		version.set('creator', {
			__type: 'Pointer',
			className: '_User',
			objectId: currentUser.id
		});

		version.set('data', treeData);

		version.set('tree', {
			__type: 'Pointer',
			className: 'Tree',
			objectId: treeId
		});

		version.save(null, {
			success: function(result) {
				response.success(result);
			},
			error: function(error) {
				response.error(error);
			}
		});
	} else {
		response.error('User not logged in or invalid data passed in.');
	}
});

Parse.Cloud.afterSave('TreeVersion', function(request) {
	var treeId = request.object.get('tree').id;
	var count = 0;

	var query = new Parse.Query('TreeVersion');
	query.equalTo('tree', {
		__type: 'Pointer',
		className: 'Tree',
		objectId: treeId
	});

	query.count().then(function(numVersions) {
		count = numVersions;
	}).then(function() {
		var query = new Parse.Query('Tree');
		query.equalTo('objectId', treeId);
		return query.first();
	}).then(function(tree) {
		tree.set('numVersions', count);
		tree.set('versionUpdatedAt', new Date());
		tree.save();
	});
});