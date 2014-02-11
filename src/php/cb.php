<?php

// Handle cross site
header('Access-Control-Allow-Origin: http://localhost');
header('Access-Control-Allow-Credentials: true');

// cross site callback
require_once('./libinc/main_include.php');

// Initialize session
$cart = new Cart();

if (!isset($_REQUEST['action'])) $_REQUEST['action'] = 'empty';

switch ($_REQUEST['action']) {
	case 'add':
		if (isset($_REQUEST['itemId'])) {
			$cart->addItem($_REQUEST['itemId']);

			echo json_encode(array(
				'items' => sizeof($_SESSION['cart']),
				'cart' => array_values($_SESSION['cart'])
			));
		}
		break;
	
	case 'get':
		echo json_encode(array_values($_SESSION['cart']));
		break;
}

/*
Snippet for website on other side
<script src="//code.jquery.com/jquery-1.10.2.min.js" type="text/javascript"></script>
<script src="//payment.upstreamacademy.com/uacart.js" type="text/javascript"></script>

<a href="#" data-item-id="x" class="cartAdd">item x</a>
*/

// future ideas http://www.nczonline.net/blog/2010/09/07/learning-from-xauth-cross-domain-localstorage/