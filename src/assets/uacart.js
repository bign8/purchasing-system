var UACart = (function($){
	var setHandle = function(ele, has) {
		ele.unbind('click');
		if (has) {
			ele.addClass('added').click(function() {
				alert('Item has already been added to your cart.');
				return false;
			});
			if (ele.find('.added').length === 0) ele.append('<span class="added"> (Added)</span>');
		} else {
			ele.removeClass('added').click(addTo).find('.added').remove();
		}
	};
	var addTo = function(e) {
		var target = $(e.target).unbind('click'), data = target.data();
		data.action = 'add';

		$.ajax({
			type: 'GET',
			dataType: 'json',
			data: data,
			url: 'http://payment.upstreamacademy.com/cb.php',
			crossDomain: true,
			xhrFields: { withCredentials: true },
			success: function( json, status, xhr ) {
				setHandle(target, true);
				$('.ua-cart-items').html(json.items);
			}
		});
		return false;
	};
	var checkCart = function() {
		$.ajax({
			type: 'GET',
			dataType: 'json',
			url: 'http://payment.upstreamacademy.com/cb.php',
			data: {action:'get'},
			crossDomain: true,
			xhrFields: { withCredentials: true},
			success: function( json, status, xhr ) {
				$('.ua-cart-items').html(json.length);
				$('a.cartAdd').each(function() {
					var ele = $(this);
					setHandle(ele, json.indexOf("" + ele.data('itemId')) >= 0);
				});
			}
		});
	};
	var timer;
	var obj = {
		init: function(selector) {
			console.log('Initializing UACart');
			selector = selector || 'a.cartAdd';
			$(selector).click( addTo );
			checkCart();
			timer = setInterval(function() {
				checkCart();
			}, 60*1000);
		},
		stop: function() {
			console.log('Timer Stopped');
			return clearInterval(timer);
		}
	};
	return obj;
})(jQuery);

$(document).ready(function() {
	UACart.init('a.cartAdd');
});