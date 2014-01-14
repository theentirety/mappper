// setUsername updates the username for a user who logs in through a service like facebook
// required: username (string): the desired username
// required: userId (string): the objectId of the user

Parse.Cloud.define('setUsername', function(request, response) {
	if (request.params.username.length <= 0) {
		response.error('A username is required');
	} else {
		var query = new Parse.Query('User');
		query.equalTo('username', request.params.username);
		query.first({
			success: function(object) {
				if (object) {
					response.error('This username is already taken');
				} else {
					var User = Parse.Object.extend('User');
					var user = new User();
					user.id = request.params.userId

					user.set('choseUsername', true);
					user.set('username', request.params.username);

					user.save(null, {
						success: function(user) {
							response.success(user);
						},
						error: function(user, error) {
							response.error(error);
						}
					});
				}
			},
			error: function(error) {
				response.error('Could not validate uniqueness for this username object');
			}
		});
	}
});


// getUserImage retrieves the string of the user image, if it exists
// required: userId (string): the id to search for

Parse.Cloud.define('getUserImage', function(request, response) {
	var query = new Parse.Query('User');
	query.equalTo('objectId', request.params.userId);
	query.first({
		success: function(user) {
			var userImage = null;
			if (user.attributes.authData) {
				if (user.attributes.authData.facebook) {
					userImage = 'http://graph.facebook.com/' + user.attributes.authData.facebook.id + '/picture';
				}
			}
			response.success(userImage);
		},
		error: function(error) {
			response.error(error);
		}
	});
});



