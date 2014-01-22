define(['knockout'], function(ko) {
	return {
		initialize: function() {
			auth_signedIn = ko.observable(false).publishOn('signedIn');
			auth_showAuthModal = ko.observable(false);
			auth_showSignInForm = ko.observable(true);
			auth_showForgotPasswordForm = ko.observable(false);
			auth_signInError = ko.observable('');
			auth_currentUser = ko.observable(null).publishOn('currentUser');
			auth_currentUserName = ko.observable().publishOn('currentUserName');
			auth_currentUserImage = ko.observable('').publishOn('currentUserImage');
			auth_showUsernameModal = ko.observable(false);
			auth_choseUsernameError = ko.observable('');
			auth_confirmMessage = ko.observable('');
			auth_showConfirmModal = ko.observable(false);
			auth_isLoading = ko.observable().subscribeTo('isLoading');

			auth_init = function() {
				var currentUser = Parse.User.current();
				if (currentUser) {
					auth_userReady();
				} else {
					auth_initUser();
				}
			}

			ko.postbox.subscribe('signIn', function() {
				auth_showAuthModal(true);
				auth_showSignInForm(true);
				ko.postbox.publish('isLightboxed', true);
			});
			ko.postbox.subscribe('signOut', function() {
				auth_signedIn(false);
				Parse.User.logOut();
			});

			auth_checkFacebookStatus = function() {
				FB.getLoginStatus(function(response) {
					return response.status;
				});
			}

			auth_sanitizeErrors = function(error) {
				switch(error.code)
				{
					case 124:
						return 'Oops! We messed up. Please try again.';
					default:
						return error.message;
				}
			}

			auth_checkForUsername = function() {
				if (!auth_currentUser().attributes.choseUsername) {
					auth_showUsernameModal(true);
				}
			}

			auth_signIn = function() {
				auth_resetError();
				ko.postbox.publish('isLoading', true);
				var username = $('#signin_username').val();
				var password = $('#signin_password').val();

				$('#signin_password').val('');			

				Parse.User.logIn(username, password, {
					success: function(user) {
						auth_userReady();
					},
					error: function(user, error) {
						// The login failed. Check error to see why.
						ko.postbox.publish('isLoading', false);
						auth_signInError(auth_sanitizeErrors(error));
						console.log(error);
					}
				});
				return false;
			}

			auth_signInWithFacebook = function() {
				ko.postbox.publish('isLoading', true);
				auth_resetError();

				var fbStatus = auth_checkFacebookStatus();

				// FB.getLoginStatus(function(response) {
				// 	if (response.status === 'connected') {
				// 		console.log('connected')
				// 		auth_initUser();
				// 	} else {
						Parse.FacebookUtils.logIn(null, {
							success: function(user) {
								auth_userReady();
							},
							error: function(user, error) {
								ko.postbox.publish('isLoading', false);
								auth_signInError(auth_sanitizeErrors(error));
								console.log(error);
							}
						});
				// 	}
				// });
			}

			auth_signUp = function() {
				auth_resetError();
				ko.postbox.publish('isLoading', true);

				var email = $('#signup_email').val();
				var username = $('#signup_username').val();
				var password = $('#signup_password').val();
				var confirm = $('#signup_confirm').val();

				if (password == confirm) {
					var user = new Parse.User();
					user.set("username", username);
					user.set("password", password);
					user.set("email", email);
					user.set("choseUsername", true);

					// other fields can be set just like with Parse.Object
					// user.set("phone", "415-392-0202");

					user.signUp(null, {
						success: function(user) {
							auth_userReady();
						},
						error: function(user, error) {
							ko.postbox.publish('isLoading', false);
							auth_signInError(auth_sanitizeErrors(error));
							console.log(error);
						}
					});
				} else {
					auth_signInError('Your passwords do not match.')
				}

				return false;
			}

			ko.postbox.subscribe('auth_logout', function() {
				Parse.User.logOut();
				auth_signedIn(false);
				auth_initUser();
			});

			auth_userReady = function() {
				auth_signedIn(true);
				auth_initUser();
				ko.postbox.publish('isLoading', false);
				ko.postbox.publish('isLightboxed', false);
				auth_showAuthModal(false);
			}

			auth_toggleSignInUp = function(option) {
				auth_resetError();
				auth_showForgotPasswordForm(false);
				auth_showSignInForm(option == 'in' ? true : false);
			}

			auth_toggleForgotPassword = function() {
				auth_resetError();
				auth_showForgotPasswordForm(auth_showForgotPasswordForm() ? false : true);
			}

			auth_resetPassword = function() {
				ko.postbox.publish('isLoading', true);
				auth_resetError();
				var email = $('#forgot_email').val();

				Parse.User.requestPasswordReset(email, {
					success: function() {
						ko.postbox.publish('isLoading', false);
						auth_signInError('An email has been sent to reset your password')
						auth_showForgotPasswordForm(false);
					},
					error: function(error) {
						ko.postbox.publish('isLoading', false);
						auth_signInError(auth_sanitizeErrors(error));
						console.log(error);
					}
				});
			}

			auth_closeModals = function() {
				auth_showAuthModal(false);
				auth_showConfirmModal(false);
				auth_showUsernameModal(false);
				auth_showSignInForm(true);
				ko.postbox.publish('isLightboxed', false);
			}

			auth_createUsername = function() {
				ko.postbox.publish('isLoading', true);
				auth_resetError();

				var username = $('#chose_username').val();
				var userId = auth_currentUser().id;

				Parse.Cloud.run('setUsername', {
					username: username,
					userId: userId
				}, {
					success: function(result) {
						// auth_initUser();
						var currentUser = Parse.User.current();
						currentUser.fetch();
						auth_currentUserName(username);
						ko.postbox.publish('isLoading', false);
						auth_showUsernameModal(false);
						auth_confirmMessage('Your username was successfully saved');
						auth_showConfirmModal(true);

					}, error: function(error) {
						ko.postbox.publish('isLoading', false);
						console.log(error);
						auth_choseUsernameError(auth_sanitizeErrors(error));
					}
				});
			}

			auth_resetError = function() {
				auth_choseUsernameError('');
				auth_signInError('');
			}

			auth_initUser = function() {
				var currentUser = Parse.User.current();
				if (currentUser && auth_signedIn()) {
					currentUser.fetch();
					auth_currentUser(currentUser);
					auth_currentUserName(auth_currentUser().attributes.username);
					if (typeof currentUser.attributes.authData != 'undefined') {
						if (typeof currentUser.attributes.authData.facebook != 'undefined') {
							auth_currentUserImage('http://graph.facebook.com/' + currentUser.attributes.authData.facebook.id + '/picture');
						}
					} else {
						auth_currentUserImage('');
					}
					auth_checkForUsername();
				} else {
					auth_currentUser(null);
					auth_currentUserName('');
					auth_currentUserImage('');
				}
			}

			auth_init();
		}
	}
});