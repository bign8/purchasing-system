<?php
// cross site callback

// Handle cross site
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Credentials: true');

// Initialize session
session_start();

// // change to past session if exists
// if (isset($_REQUEST['sessionID'])) {
// 	session_id( $_REQUEST['sessionID']  );
// }

// create sesson array
if (!isset($_SESSION['cart'])) {
	$_SESSION['cart'] = array();
}

// add item to cart
if (isset($_REQUEST['itemId'])) {

	if (false===array_search($_REQUEST['itemId'], $_SESSION['cart'])) {
		array_push($_SESSION['cart'], $_REQUEST['itemId']);
	}
	
	echo json_encode(array(
		'items' => sizeof($_SESSION['cart']),
		// 'id' => session_id()
	));
} else {
	// document print (for debug)
	echo '<pre>';
	print_r($_SESSION);
}

/*
Snippet for website on other side

<script src="//code.jquery.com/jquery-1.10.2.min.js" type="text/javascript"></script>
<script type="text/javascript">
	$(document).ready(function() {
		$('a.cartAdd').click(function(e) {
			var target = $(e.target).unbind('click');
			$.ajax({
				type: 'GET',
				dataType: 'json',
				data: target.data(),
				url: 'http://uastore.wha.la/cb.php',
				crossDomain: true,
				xhrFields: { withCredentials: true },
				success: function( json, status, xhr ) {
					console.log(json);
					target.append(' (Added to cart)').click(function() {
						alert('Item has already been added to your cart');
					});
				}
			});
			return false;
		});
	});
</script>

<a href="#" data-item-id="x" class="cartAdd">item x</a>
*/

// future ideas http://www.nczonline.net/blog/2010/09/07/learning-from-xauth-cross-domain-localstorage/