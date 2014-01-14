<?php

class Cart extends NG {

	private $usr;

	// Constructor: Initialize session and db connections
	function __construct() {
		parent::__construct();

		if ( !isset($_SESSION['cart']) ) $_SESSION['cart'] = array(); // assign empty cart if applicable
		if ( !isset($_SESSION['cart.options']) ) $_SESSION['cart.options'] = array(); // assign empty cart.options if applicable
		if ( !isset($_SESSION['cart.discounts']) ) $_SESSION['cart.discounts'] = array(); // assign empty cart.discounts if applicable
		$this->usr = new User();
	}

	// CART ACTIONS

	// Worker(app): return cart with current prices
	public function get() {
		$user = $this->usr->currentUser(); // gets user if available

		$checkSTH = $this->db->prepare("SELECT purchaseID FROM `purchase` WHERE firmID=? and itemID=?;");

		// remove all non-strings to allow invoices, but still grab purchase id's
		$cleanIDs = array();
		foreach($_SESSION['cart'] as $itemID) if (is_string($itemID)) array_push($cleanIDs, $itemID);

		// Grab pending group purchases
		$queryMarks = trim( str_repeat( "?,", sizeof( $cleanIDs ) ), "," );
		$pendingGroupsSTH = $this->db->prepare("SELECT i.settings FROM (SELECT * FROM `item` WHERE itemID IN ($queryMarks)) i LEFT JOIN `product` p ON i.productID=p.productID LEFT JOIN `template` t ON p.templateID=t.templateID WHERE template='group';");
		$pendingGroupsSTH->execute( $cleanIDs );

		// parse out their groupID's
		$arrGroupID = array();
		while ( $row = $pendingGroupsSTH->fetch( PDO::FETCH_ASSOC ) ) {
			$rowData = (array) json_decode($row['settings']);
			array_push( $arrGroupID, $rowData['groupID'] );
		}
		$this->groupCashe = $arrGroupID; // store for later use in getItemByID() -> getProductCost()

		// Iterate through ID's and grab items or pass objects through
		$retData = array();
		setlocale(LC_MONETARY, 'en_US');
		foreach ($_SESSION['cart'] as $itemID) {
			if (is_string($itemID)) {
				$item = $this->getItemByID( $itemID );
				if ($item != null) {

					// warn if item has already been purchased
					$checkSTH->execute( $user['firmID'], $itemID );
					$item['warn'] = ($checkSTH->rowCount() > 0);

					array_push($retData, $item);
				}
			} else { // format cost for carts
				$cost = $itemID['cost'];
				$itemID['cost'] = array(
					'pretty' => '$' . money_format('%n', $cost),
					'settings' => array(
						"cost" => $cost
					)
				);
				array_push($retData, $itemID);
			}

		}

		return $retData;
	}
	private function getItemByID( $itemID ) { // Helper(get): return specific item detail by id
		$itemSTH = $this->db->prepare("SELECT i.*, t.template FROM (SELECT * FROM `item` WHERE itemID = ?) i JOIN product p ON p.productID=i.productID JOIN template t ON t.templateID = p.templateID;");
		// $itemSTH = $this->db->prepare("SELECT i.*, t.template, COUNT(f.tiePFID) as `options` FROM (SELECT * FROM `item` WHERE itemID = ?) i JOIN product p ON p.productID=i.productID JOIN template t ON t.templateID = p.templateID LEFT JOIN `tie_product_field` f ON f.productID = i.productID GROUP BY i.itemID, i.productID, i.name, i.description, i.settings, i.img, i.blurb, t.template;");
		// $itemSTH = $this->db->prepare("SELECT * FROM `item` WHERE itemID = ?;");
		if (!$itemSTH->execute( $itemID )) return -1;
		$row = $itemSTH->fetch(PDO::FETCH_ASSOC);
		if (!isset($row['productID'])) return null; // if can't find product
		$row['settings'] = json_decode($row['settings']);
		// unset($row['settings']);
		$row['cost'] = $this->getProductCost( $row['productID'] );
		return $row;
	}
	private function getProductCost( $productID ) { // Helper(get): return cost for a productID
		$user = $this->usr->currentUser();

		// pull groups based on firmID if user is assigned
		$groups = array();
		if ($user != null) {
			$groupSTH = $this->db->prepare("SELECT groupID FROM `member` WHERE firmID=?;");
			$groupSTH->execute( $user['firmID'] );
			$groups = $groupSTH->fetchAll( PDO::FETCH_COLUMN );
		}
		$groups = array_merge($groups, array(0)); // ensure not empty
		if (isset($this->groupCashe)) $groups = array_merge($groups, $this->groupCashe); // add groups that are in cart
		
		// pull prices that match productID and group criteria
		$questionMarks = trim(str_repeat("?,", sizeof($groups)),","); // build string of questionmarks based on sizeof($groups)
		$costSTH = $this->db->prepare("SELECT `name`, `pretty`, `settings` FROM `price` p JOIN `option` o ON o.optionID = p.optionID WHERE productID=? AND (groupID IN ($questionMarks) OR groupID IS NULL);");
		array_unshift( $groups, $productID ); // put productID at the beginninng of the array
		$costSTH->execute( $groups );
		$costRows = $costSTH->fetchAll(PDO::FETCH_ASSOC);

		// find least price
		$leastRow = null;
		$leastCost = null;
		foreach ($costRows as $row) {
			$cost = (array)json_decode($row['settings']); // parse settings out to compare

			if ($leastRow == null) { // if no previous leasts, the first is the least
				$leastCost = $cost;
				$leastRow = $row;
			} else { // conditionally check based off of specified parameters
				switch ($row['name']) {
					case 'Static Cost':
						if ($leastCost['cost'] > $cost['cost']) {
							$leastCost = $cost;
							$leastRow = $row;
						}
						break;
					
					case 'Delayed attendee cost':
						if ($leastCost['initial'] > $cost['initial']) {
							$leastCost = $cost;
							$leastRow = $row;
						}
						break;
				}
			}
			
		}
		
		// parse json for interpolating and pretty printing
		$subs = (array)json_decode($leastRow['settings']);
		$pretty = $subs;

		// convert specific values to currency (excluding the values mentioned in the case statements)
		setlocale(LC_MONETARY, 'en_US');
		foreach ($pretty as $key => $value) {
			switch ($key) {
				case 'after': continue; break;
				default: $pretty[$key] = '$' . money_format('%n', $value); break;
			}
		}

		return array(
			'pretty' => $this->interpolate($leastRow['pretty'], $pretty),
			'settings' => $subs
		);
	}

	// Worker: remove element from cart
	public function rem() {
		$data = $this->getPostData();

		if ($data->itemID == -1) { // wierd thing to make custom payments work
			$data->cost = $data->cost->settings->cost; // clean cost

			$_SESSION['cart'] = array_values( array_udiff($_SESSION['cart'], array( $this->object_to_array($data) ), function($a, $b) {
				$tempA = json_encode($a);
				$tempB = json_encode($b);
				if ($tempA == $tempB) { return 0; } elseif ($tempA < $tempB) { return -1; } else { return 1; }
			}) );

		} else {
			if (isset($_SESSION['cart.options'][$data->itemID])) unset($_SESSION['cart.options'][$data->itemID]);
			$_SESSION['cart'] = array_diff($_SESSION['cart'], array($data->itemID) ); // http://stackoverflow.com/a/9268826
		}
		$this->chkDiscounts();
		return $data; // debug
	}

	// Worker: add invoice to cart
	public function add() {
		$data = $this->object_to_array( $this->getPostData() );
		$pass = false;

		if (false===array_search($data, $_SESSION['cart'])) {
			array_push($_SESSION['cart'], $data);
			$pass = ture;
		}
		return $pass;
	}

	// Worker: clear cart
	public function clr() {
		$_SESSION['cart'] = array();
		$_SESSION['cart.options'] = array();
		$_SESSION['cart.discounts'] = array();
	}

	// CART.OPTIONS ACTIONS

	// Worker: return all options
	public function getOptions() {
		return $_SESSION['cart.options'];
	}

	// Worker: return conference options
	public function getOption() {
		$data = $this->getPostData();

		$item = $this->getItemByID( $data->itemID ); // get item + cost information
		$fields = $this->getProductFields( $item['productID'] ); // get fields for a product
		if ($fields == -1) return $this->conflict();

		$item = is_null( $item ) ? array( 'name'=>'Not Found' ) : $item ; // account for empty case
		$options = isset($_SESSION['cart.options'][$data->itemID]) ? $_SESSION['cart.options'][$data->itemID] : new stdClass(/*empty obj*/) ;
		return array(
			'item' => $item,
			'fields' => $fields,
			'options' => $options
		);
	}
	private function getProductFields( $productID ) { // Helper: return question's options
		$STH = $this->db->prepare("SELECT f.*, t.required FROM `tie_product_field` t JOIN `field` f ON f.fieldID = t.fieldID WHERE productID=? ORDER BY `order`;");
		if (!$STH->execute( $productID )) return -1; // on error

		$retData = $STH->fetchAll(PDO::FETCH_ASSOC);
		foreach ($retData as &$item) { $item['settings'] = json_decode($item['settings']); } // Decode those settings!
		return $retData;
	}

	// Worker: set cart options
	public function setOption() {
		$data = $this->getPostData();
		$_SESSION['cart.options'][ $data->item->itemID ] = $this->object_to_array( $data->options );
	}

	// CART.DISCOUNTS ACTIONS

	// Worker: return all disocunts
	public function getDiscount() {
		return $_SESSION['cart.discounts'];
	}

	// Worker/Helper (chkDiscounts): remove single discount
	public function remDiscount($data = null) {
		$data = (isset($data)) ? $data : $this->object_to_array( $this->getPostData() );
		$_SESSION['cart.discounts'] = array_values( array_udiff($_SESSION['cart.discounts'], array( $data ), function($a, $b){
			$tempA = $a['discountID'];
			$tempB = $b['discountID'];
			if ($tempA == $tempB) { return 0; } elseif ($tempA < $tempB) { return -1; } else { return 1; }
		}) );
		return $_SESSION['cart.discounts'];
	}

	// Worker: return discount object
	public function addDiscount() {
		$data = $this->getPostData();

		// Check if any code matches the inputed code
		$anyCodeSTH = $this->db->prepare("SELECT discountID FROM `discount` WHERE `code`=?;");
		if (!$anyCodeSTH->execute( $data->code ) || $anyCodeSTH->rowCount() == 0) 
			return array('pre'=>'Error!','msg'=>'Invalid discount code.', 'type'=>'error');
		$codeID = $anyCodeSTH->fetchColumn();

		// Check if code is still valid
		$validTimeSTH = $this->db->prepare("SELECT * FROM `discount` WHERE `active`='yes' AND discountID=?;");
		if (!$validTimeSTH->execute( $codeID ) || $validTimeSTH->rowCount() == 0) 
			return array('pre'=>'Sorry!', 'msg'=>'This code has expired!', 'type'=>'error');

		// server duplicate check
		$found = false;
		foreach ($_SESSION['cart.discounts'] as $discount) if ($discount['discountID'] == $codeID) $found = true;
		if ($found) return array('pre'=>'Duplicate Code!', 'msg'=>'Are you trying to cheat us?', 'type'=>'error');

		// test if valid for current cart
		$ids = array("0");
		foreach ($_SESSION['cart'] as $itemID) array_push($ids, $itemID); // grab ids from current cart
		$questionMarks = trim(str_repeat("?,", sizeof($ids)),",");
		$finalSTH = $this->db->prepare("SELECT * FROM `discount` WHERE ((productID IN (SELECT DISTINCT productID FROM `item` WHERE itemID IN ($questionMarks)) AND itemID IS NULL) OR (productID IS NULL AND itemID IN ($questionMarks)) OR (productID IS NULL AND itemID IS NULL) ) AND discountID = ?;");
		if (!$finalSTH->execute( array_merge( $ids, $ids, array($codeID) ) ) || $finalSTH->rowCount() == 0) 
			return array('pre'=>'Unrelated!', 'msg'=>'Not associated with any items in your cart.', 'type'=>'error');

		$obj = $finalSTH->fetch(PDO::FETCH_ASSOC);
		array_push($_SESSION['cart.discounts'], $obj);
		// successfull callback
		return array('pre'=>'Success!', 'msg'=>'Added discount to current order!', 'type'=>'success', 'obj'=>$obj );
	}

	// Helper: check discounts agains removed item
	private function chkDiscounts() {
		$ids = array("0");
		foreach ($_SESSION['cart'] as $itemID) array_push($ids, $itemID); // grab ids from current cart
		$questionMarks = trim(str_repeat("?,", sizeof($ids)),",");
		$finalSTH = $this->db->prepare("SELECT * FROM `discount` WHERE ((productID IN (SELECT DISTINCT productID FROM `item` WHERE itemID IN ($questionMarks)) AND itemID IS NULL) OR (productID IS NULL AND itemID IN ($questionMarks)) OR (productID IS NULL AND itemID IS NULL) ) AND discountID = ?;");
		foreach ($_SESSION['cart.discounts'] as $discount) {
			if (!$finalSTH->execute( array_merge( $ids, $ids, array($discount['discountID']) ) ) || $finalSTH->rowCount() == 0) {
				$this->remDiscount( $discount );
			}
		}
	}

	// GENERIC CART FUNCTION

	// Worker(app/checkout): save cart
	public function save() {
		$user = $this->usr->requiresAuth();
		$data = $this->getPostData();

		// Insert order
		$orderSTH = $this->db->prepare("INSERT INTO `order` (contactID, medium) VALUES (?,?);");
		if (!$orderSTH->execute( $user['contactID'], $data->medium )) return $this->conflict();
		$orderID = $this->db->lastInsertId();

		// Store purchases and options
		$purchaseSTH = $this->db->prepare("INSERT INTO `purchase` (itemID, orderID, firmID, data) VALUES (?,?,?,?);");
		$attendeeSTH = $this->db->prepare("INSERT INTO `attendee` (itemID, contactID) VALUES (?,?);");
		$memberSTH = $this->db->prepare("INSERT INTO `member` (firmID, groupID) VALUES (?,?);");
		$cart = $this->get(); // removes random id's
		foreach ($cart as $item) { // iterate over items
			if ($item['itemID'] == '-1') continue; // don't care about custom payment storage (yet)
			$option = isset($_SESSION['cart.options'][ $item['itemID'] ]) ? $_SESSION['cart.options'][ $item['itemID'] ] : array(); // get item's object

			if (isset($option['attID'])) { // store attendees
				foreach($option[$option['attID']] as &$contact) {
					if (!$attendeeSTH->execute($item['itemID'], $contact['contactID'])) return $this->conflict();
					$contact['attendeeID'] = $this->db->lastInsertId();
				}
			}

			if (isset($item['settings']->groupID)) { // store groups
				if (!$memberSTH->execute($user['firmID'], $item['settings']->groupID)) return $this->conflict();
				$option['memberID'] = $this->db->lastInsertId();
			}
			if (!$purchaseSTH->execute($item['itemID'], $orderID, $user['firmID'], json_encode($option))) return $this->conflict(); // store purchase here
		}

		// $this->emailCart($orderID, $data->cost);
		$this->clr();

		return $orderID;	
	}


	// UNTESTED FUNCTIONS

	// Helper(app/cart/checkout/email): email cart data
	public function emailCart($orderID) {
		// grab order info
		$orderSTH = $this->db->prepare("SELECT * FROM `order` WHERE `orderID`=? LIMIT 1;");
		$orderSTH->execute( $orderID );
		$order = $orderSTH->fetch(PDO::FETCH_ASSOC);

		// grab contact info
		$contactSTH = $this->db->prepare("SELECT c.firmID, c.legalName, c.preName, c.title, c.email, c.phone, a.* FROM `contact` c LEFT JOIN `address` a ON c.addressID=a.addressID WHERE `contactID`=? LIMIT 1;");
		$contactSTH->execute( $order['contactID'] );
		$contact = $contactSTH->fetch(PDO::FETCH_ASSOC);

		// grab contacts firm info
		$firmSTH = $this->db->prepare("SELECT f.name, f.website, a.* FROM `firm` f LEFT JOIN `address` a on f.addressID=a.addressID WHERE firmID=? LIMIT 1;");
		$firmSTH->execute( $contact['firmID'] );
		$firm = $firmSTH->fetch(PDO::FETCH_ASSOC);

		// grab order
		$itemsSTH = $this->db->prepare("SELECT p.data, i.* FROM `purchase` p LEFT JOIN `item` i ON p.itemID=i.itemID WHERE orderID=?;");
		$itemsSTH->execute( $orderID );
		$items = $itemsSTH->fetchAll(PDO::FETCH_ASSOC);

		// setup attendees grab
		$attendeeSTH = $this->db->prepare("SELECT c.legalName, c.preName, c.title, c.email, c.phone, d.* FROM (SELECT contactID FROM `attendee` a WHERE itemID=?) a LEFT JOIN `contact` c ON a.contactID=c.contactID LEFT JOIN `address` d ON c.addressID=d.addressID;");

		// Pretty print addresses
		function address($data) {
			$str  = "{$data['addr1']}<br />\r\n";
			if ($data['addr2']!='') 
				$str .= "{$data['addr2']}<br />\r\n";
			$str .= "{$data['city']} {$data['state']}, {$data['zip']}<br />\r\n";
			return $str;
		}

		// pretty print data for email
		$html  = "<b>Order#:</b> $orderID<br />\r\n";
		$html .= "<b>Status / medium:</b> {$order['status']} / {$order['medium']}<br />\r\n";
		$html .= "<b>Time:</b> {$order['stamp']}<br />\r\n";
		$html .= "<hr/><b>Purchase Contact:</b><br />\r\n";
		$html .= "<a href=\"mailto:{$contact['email']}\" >{$contact['title']} {$contact['legalName']} ({$contact['preName']})</a><br />\r\n";
		$html .= address($contact);
		$html .= "Phone: <a href=\"tel:{$contact['phone']}\">{$contact['phone']}</a><br />\r\n";
		$html .= "<hr/><b>Purchase Firm:</b><br />\r\n";
		$html .= "<a href=\"{$firm['website']}\">{$firm['name']}</a><br />\r\n";
		$html .= address($firm);
		$html .= "<hr/>Items:<br /><ul>\r\n";

		foreach ($items as $item) {
			$html .= "<li><a href=\"http://uastore.wha.la/#/products/{$item['productID']}/{$item['itemID']}\">{$item['name']}</a><ul>";
			$data = json_decode($item['data']);
			foreach ($data as $key => $value) {
				if ($key == "+Attendees") { // pretty print attendees
					$html .= "<li><b>Attendee(s):</b><ul>";
					$attendeeSTH->execute( $item['itemID'] );
					while ($row = $attendeeSTH->fetch( PDO::FETCH_ASSOC )) {
						$html .= "<li>";
						$html .= "<a href=\"mailto:{$row['email']}\" >{$row['title']} {$row['legalName']} ({$row['preName']})</a><br />\r\n";
						$html .= address($row);
						$html .= "Phone: <a href=\"tel:{$row['phone']}\">{$row['phone']}</a><br />\r\n";
						$html .= "</li>";
					}
					$html .= "</ul></li>";
				} else {
					$html .= "<li><b>" . substr($key, 1) . ':</b> ' . $value . "</li>";
				}
			}
			$html .= "</ul></li>";
		}

		$html .= "</ul>\r\n";

		echo $html;
		// echo mail('nwoods@azworld.com', 'Test Email', 'Da test <b>HTML</b> email.') ? 'true' : 'false';
		// echo mail('big.nate.w@gmail.com', 'Test Email', 'Da test <b>HTML</b> email.') ? 'true' : 'false';
	}

	// Worker(app/purchases): return purchases
	public function getPurchases() {
		$user = $this->requiresAuth();

		$STH = $this->db->prepare("SELECT i.*, p.data, t.template, o.stamp FROM (SELECT * FROM `purchase` WHERE firmID=?) p LEFT JOIN item i ON p.itemID=i.itemID LEFT JOIN `product` pr ON i.productID=pr.productID LEFT JOIN `template` t ON pr.templateID=t.templateID LEFT JOIN `order` o ON p.orderID=o.orderID ORDER BY i.productID, i.name;");
		$STH->execute( $user['firmID'] );

		$retData = $STH->fetchAll( PDO::FETCH_ASSOC );
		foreach ($retData as &$item) {
			$item['settings'] = json_decode($item['settings']);
			$item['data'] = json_decode($item['data']);
		}
		return json_encode($retData);
	}
}