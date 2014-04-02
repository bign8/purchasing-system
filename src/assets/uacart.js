var UACart = (function($){
	var url = 'http://payment.upstreamacademy.com/cb.php';

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

		while (!$(e.target).hasClass('cartAdd')) {
			e.target = $(e.target).parent()[0];
		}

		var target = $(e.target).unbind('click'), data = target.data();
		data.action = 'add';

		$.ajax({
			type: 'GET',
			dataType: 'jsonp',
			data: data,
			url: url,
			success: function( json ) {
				setHandle(target, true);
				$('.ua-cart-items').html(json.items);
			}
		});
		return false;
	};
	var checkCart = function() {
		$.ajax({
			type: 'GET',
			dataType: 'jsonp',
			url: url,
			data: {action:'get'},
			success: function( json ) {
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