<!-- START DEV -->
<html>
<head>
	<title>Test</title>
	<script src="//code.jquery.com/jquery-1.10.2.min.js" type="text/javascript"></script>
	<script src="/uacart.js" type="text/javascript"></script>
</head>
<body>

	<h1>Website simulator</h1>
<?php

require_once('./libinc/main_include.php');

class printer {
	function __construct() {
		$this->db = new myPDO();
		// mysql note: use "<=>" the null save equal operator; source: http://bit.ly/1giuNOP
		$e = ($this->db->getAttribute( PDO::ATTR_DRIVER_NAME ) == 'sqlite') ? 'is' : '<=>' ; // sqlite and mysql support
		$this->sth = $this->db->prepare("SELECT * FROM `item` WHERE parentID $e ? ORDER BY `name`;");
	}
	public function printChildren( $parentID = null ) {
		$this->sth->execute( $parentID );
		$items = $this->sth->fetchAll( PDO::FETCH_ASSOC );
		$list = '';
		if (count($items) > 0) {
			foreach ($items as $item) {
				$children = $this->printChildren( $item['itemID'] );
				if (strlen($children) > 0) {
					$list .= "<li><strong>{$item['name']}:</strong> {$item['desc']} $children</li>\r\n"; // without link
				} else {
					$list .=  "<li>"; // with link
					$list .=  "<a href=\"#\" class=\"cartAdd\" data-item-id=\"{$item['itemID']}\">Cart</a> ";
					$list .=  "<a href=\"/conference/{$item['itemID']}\">Register</a> ";
					$list .=  "{$item['name']}: {$item['desc']}</li>\r\n";
				}
			}
			$list = "<ul>\r\n$list</ul>\r\n";
		}
		return $list;
	}
}
$obj = new printer();
echo $obj->printChildren();

?>
	<div style="position:fixed;bottom:0;right:0;margin:15px 20px">
		<a href="/">Cart (<span class="ua-cart-items">0</span>)</a>
	</div>

	<script src="http://127.0.0.1:1337/livereload.js"></script>
</body>
</html>
<!-- END DEV -->