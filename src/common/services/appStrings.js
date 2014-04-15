angular.module('myApp.common.services.appStrings', []).

factory('appStrings', function() {
	var ERROR = 'danger', SUCCESS = 'success', INFO = 'info';

	// Notify strings (need to be functionalized)
	var STRINGS = {
		cart: { // Cart Pages
			disc_dup: { // Duplicate Discount (notify object)
				pre: 'Duplicate Code!',
				msg: 'Are you trying to cheat us?',
				type:ERROR
			},
			disc_inv: { // Invalid Discount (notify object)
				pre: 'Invalid!',
				msg: 'We do not have this code listed.<br/>Please try again or contact us at <a href="mailto:info@upstreamacademy.com">info@upstreamacademy.com</a> with questions.',
				type:ERROR
			},
			disc_exp: { // Expired Discount (notify object)
				pre: 'Expired!',
				msg: 'This code has expired!',
				type:ERROR
			},
			disc_unr: { // Unrelated Discount (notify object)
				pre: 'Unrelated!',
				msg: 'Not associated with any items in your cart.',
				type:ERROR
			},
			disc_yep: { // Unrelated Discount (notify object)
				pre: 'Success!',
				msg: 'Added discount to current order!',
				type:SUCCESS
			},
			needOpt: { // Options needed (notify object)
				pre: 'Information Needed',
				msg: 'Some of the items in your cart require you to fill out a form.<br/>Please click the orange buttons to provide this information.',
				type:ERROR, delay:20
			},
			prevPur: { // Previous Purchase (notify object)
				pre: 'Previous Purchase',
				msg: 'An item in your cart has already been purchased (shown in red).  Please remove it before continuing to checkout.',
				type:ERROR, delay:20
			},
			checkOut: { // Checkout Complete (notify object)
				pre: 'Checkout Complete',
				msg: 'You will be redirected to your appropriate payment processing method',
				type:SUCCESS, delay:20
			},
			negative: { // Negative Cart
				pre: 'Negative Cart',
				msg: 'You have provided information in such a way that we are paying you.  Please contact us directly if we owe you money',
				type:ERROR, delay:20
			},
			warn: {
				pre: 'Previously purchased items in cart',
				msg: 'You will have to remove the items marked in <span style="color:red">RED</span> before you can checkout',
				type:INFO, delay:60
			}
		},
		contact: { // Modal address form (register/xx > add attendee > add employee)
			address: { // No contact address (notify object)
				pre: 'No address!',
				msg: 'Please assign an address to this new contact.',
				type:ERROR
			},
			error: { // Server error (notify object)
				pre: 'Server error!',
				msg: 'There was an error on our side of things, please try again later or contact us.',
				type:ERROR
			},
			duplicate: { // Duplicate email
				pre:'Duplicate Email!',
				msg:'This email is already associated with an account in the system.  Please choose "Select Employee" to find them or choose a different email.',
				type:ERROR
			}
		},
		payment: { // Custom payment form
			success: {
				pre:'Thank you!',
				msg:'The payment amount you enterd has been added to your cart.',
				type:SUCCESS, delay:5
			},
			failure: { // Server Error
				pre:'Error!', msg:'A payment with this name and value is already in your cart.',
				type:ERROR
			}
		},
		register: { // Registration Form
			passMatch: { // Passwords Match
				pre:'Passwords do not match!',
				msg:'Please try again.',
				type:ERROR
			},
			firmAddr: { // Assign Firm Address
				pre:'No firm Address!',
				msg:'Please assign a firm address.',
				type:ERROR
			},
			userAddr: { // Assign User Address
				pre:'No user Address!',
				msg:'Please assign a user address.',
				type:ERROR
			},
			success: { // Account created
				pre:'Success!',
				msg:'Your account has successfully been created',
				type:SUCCESS
			},
			duplicate: { // Duplicate email
				pre:'Duplicate Email!',
				msg:'This email already has an account.  Please click the login button and attempt a password reset.',
				type:ERROR
			},
			failure: { // Server Error
				pre:'Error!',
				msg:'There was an unknown error creating your account.  Please try again or contact Upstream Academy for help.',
				type:ERROR
			},
			resetGood: { // successful reset
				pre:'Reset Complete',
				msg:'You have been sent an email with instructions on resetting you password.',
				type:SUCCESS
			},
			resetBad: { // un-successful reset
				pre:'Reset Error',
				msg:'There has been an error resetting your password.  Please try again soon',
				type:ERROR
			},
			invalidPhone: { // invalid phone number
				pre:'Invalid Phone Number',
				msg:'Please include only 10 digits in your phone number',
				type:ERROR
			}
		},
		user: { // Account settings Form
			passMatch: { // Passwords Match
				pre:'Passwords do not match!',
				msg:'Please try again.',
				type:ERROR
			},
			firmAddr: { // Assign Firm Address
				pre:'No firm Address!',
				msg:'Please assign a firm address.',
				type:ERROR
			},
			userAddr: { // Assign User Address
				pre:'No user Address!',
				msg:'Please assign a user address.',
				type:ERROR
			},
			success: { // Account created
				pre:'Success!',
				msg:'Your Account has been updated.',
				type:SUCCESS
			},
			dupEmail: { // Duplicate email
				pre:'Duplicate Email!',
				msg:'This email already has an account. Please click the login button and attempt a password reset.',
				type:ERROR
			},
			badPass: { // Bad password
				pre:'bad Password!',
				msg:'Your password is incorrect. Please try again or attempt to reset you password.',
				type:ERROR
			},
			failure: { // Server Error
				pre:'Error!',
				msg:'There was an unknown error creating your account. Please try again or contact Upstream Academy for help.',
				type:ERROR
			},
			dupCode: { // duplicate membership
				pre:'Duplicate Membership!',
				msg:'Your firm already has membership in this group.',
				type:ERROR
			},
			dneCode: { // membership does not exist
				pre:'Does Not Exist!',
				msg:'This firm code does not exist.',
				type:ERROR
			},
			errCode: {
				pre:'Error!',
				msg:'There was an unknown error checking you group access code.  Please try again or contact UpstreamAcademy for help.',
				type:ERROR
			},
			goodCode: {
				pre:'Success!',
				msg:'Your Firm membership has been approved and has been added to your account.',
				type:SUCCESS
			},
			invalidPhone: { // invalid phone number
				pre:'Invalid Phone Number',
				msg:'Please include only 10 digits in your phone number',
				type:ERROR
			}
		},
		address: {
			error: { // server error
				pre:'Error!',
				msg:'There was an unknown error creating your address.  Please try again or contact Upstream Academy for help.',
				type:ERROR
			}
		},
		reset: {
			match: { // Passwords Match
				pre:'Passwords do not match!',
				msg:'Please try again.',
				type:ERROR
			},
			error: { // some server error
				pre:'Error!',
				msg: 'There was an unknown error creating your address.  Please try again or contact Upstream Academy for help.',
				type:ERROR
			}
		},
		conference: {
			attendee: { // Passwords Match
				pre:'Whose coming?',
				msg:'Please add at least one Attendee.',
				type:ERROR
			},
			error: { // some server error
				pre:'Error!',
				msg: 'There was an unknown error saving your information.  Please try again or contact Upstream Academy for help.',
				type:ERROR
			},
			immutable: {
				pre:'Heads up!',
				msg:'Previously purchased attendees are visible in this view.  They cannot be removed and they will not be added toward your total.',
				type:INFO, delay: 60
			}
		}
	};

	// interpolate + functionalize!
	var interpolate = function(str, obj) { // http://stackoverflow.com/a/1408373/3220865
		return str.replace(/{([^{}]+)}/g, function (match, p1) {
			return typeof obj[p1] === 'string' || typeof obj[p1] === 'number' ? obj[p1] : match;
		});
	};
	angular.forEach(STRINGS, function (area) {
		angular.forEach(area, function (obj, key) {
			area[key] = function (interObj) {
				if (interObj) obj.msg = interpolate(obj.msg, interObj);
				obj.random = Math.random();
				return obj;
			};
		});
	});

	// Not functionalized
	angular.extend(STRINGS, {
		ERROR: ERROR,
		SUCCESS: SUCCESS,
		INFO: INFO,
		paypal: { // Pay-pal (this is for the app)
			url: 'https://payflowlink.paypal.com',
			uri: { // used $.param()
				'AMOUNT': '0',
				'DESCRIPTION': 'Upstream Academy Purchase',
				'LOGIN': 'UpstreamAcademy',
				'MODE': 'TEST',
				'PARTNER': 'PayPal',
				'SHOWCONFIRM': 'FALSE',
				'TYPE': 'S'
			},
			totalParam: 'AMOUNT'
		},
		pay: {
			customPayName: 'Custom Payment' // shows up in cart
		}
	});

	return STRINGS;
});