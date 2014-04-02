<?php

// cross site callback
require_once('./libinc/main_include.php');

// Initialize session
$data = array();
$cart = new Cart();

if (!isset($_REQUEST['action'])) $_REQUEST['action'] = 'empty';
switch ($_REQUEST['action']) {
	case 'add':
		if (isset($_REQUEST['itemId'])) {
			$cart->addItem($_REQUEST['itemId']);

			$data = array(
				'items' => sizeof($_SESSION['cart']),
				'cart' => array_values($_SESSION['cart'])
			);
		}
		break;
	
	case 'get':
		$data = array_values($_SESSION['cart']);
		break;
}

// JSONP stuff
$callback = isset($_GET['callback']) ? preg_replace('/[^a-zA-Z0-9$_.]/s', '', $_GET['callback']) : false;
header('Content-Type: ' . ($callback ? 'application/javascript' : 'application/json') . ';charset=UTF-8');
header('Access-Control-Allow-Origin: *');
echo ($callback ? $callback . '(' : '') . json_encode($data) . ($callback ? ')' : '');

/*
Snippet for website on other side
<script src="//code.jquery.com/jquery-1.10.2.min.js" type="text/javascript"></script>
<script src="//payment.upstreamacademy.com/uacart.js" type="text/javascript"></script>

<a href="#" data-item-id="x" class="cartAdd">item x</a>
*/

// future ideas http://www.nczonline.net/blog/2010/09/07/learning-from-xauth-cross-domain-localstorage/