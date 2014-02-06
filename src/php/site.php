<html>
<head>
	<title>Test</title>
	<script src="//code.jquery.com/jquery-1.10.2.min.js" type="text/javascript"></script>
	<script src="//payment.upstreamacademy.com/uacart.js" type="text/javascript"></script>
</head>
<body>

	<h1>Website simulator</h1>
<?php

require_once('./libinc/main_include.php');

$db = new myPDO();

$itemSTH = $db->prepare("SELECT * FROM `item` WHERE productID=? ORDER BY `name`;");
$prodSTH = $db->query("SELECT * FROM `product` ORDER BY `name`;");
$products = $prodSTH->fetchAll( PDO::FETCH_ASSOC );

foreach ($products as $product) {
	$itemSTH->execute( $product['productID'] );

	echo '<h3>' . $product['name'] . '</h3>' . "\r\n";

	echo '<ul>' . "\r\n";
	while ($item = $itemSTH->fetch( PDO::FETCH_ASSOC )) {
		echo '<li>';
		echo '<a href="#" class="cartAdd" data-item-id="' . $item['itemID'] . '">Cart</a> ';
		echo '<a href="/conference/' . $item['itemID'] . '">Register</a> ';
		echo $item['name'] . ': ' . $item['description'] . '</li>' . "\r\n";
	}
	echo '</ul>' . "\r\n";
}

?>
	<div style="position:fixed;bottom:0;right:0;margin:15px 20px">
		<a href="/">Cart (<span class="ua-cart-items">0</span>)</a>
	</div>

	<script src="http://127.0.0.1:1337/livereload.js"></script>
</body>
</html>