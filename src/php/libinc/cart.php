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

		list($this->cartIDs, $this->cartMarks) = $this->getAllCartParentIDs(); // Store current cartID's for later
		$this->pastIDs = array('0');
	}

	public static function process( $action, &$pass, &$data ) {
		$obj = new Cart();
		switch ( $action ) {
			// Cart Functions
			case 'get': $data = $obj->get(); break; // get entire cart
			case 'rem': $data = $obj->rem(); break; // remove item from cart
			case 'add': $data = $obj->add(); break; // add invoice to cart
			case 'clr': $data = $obj->clr(); break; // clear cart

			// Cart.Options Functions
			case 'getOptions': $data = $obj->getOptions(); break; // get all options
			case 'getOption':  $data = $obj->getOption();  break; // get conference form data
			case 'setOption':  $data = $obj->setOption();  break; // get conference form data

			// Cart.Discount Functions
			case 'getDiscount': $data = $obj->getDiscount(); break; // get all discounts
			case 'addDiscount': $data = $obj->addDiscount(); break; // add discounts
			case 'remDiscount': $data = $obj->remDiscount(); break; // rem discounts

			// Generic Functions
			case 'getFullCart':  $data = $obj->getFullCart();  break;
			case 'getPurchases': $data = $obj->getPurchases(); break;
			case 'save':         $data = $obj->save();         break;
			default: $pass = false;
		}
	}

	// CART ACTIONS

	public function getFullCart() {
		return array(
			'cart' => $this->get(),
			'options' => $this->getOptions(),
			'discounts' => $this->getDiscount()
		);
	}

	// Worker(app): return cart with current prices
	public function get() {
		$user = $this->usr->currentUser(); // gets user if available

		// Past purchase id's
		$STH = $this->db->prepare("SELECT itemID FROM 'purchase' WHERE firmID=? OR contactID=?;"); // grab all previous purchases
		if (!$STH->execute( $user['firmID'], $user['contactID'] )) return $this->conflict();
		while ($row = $STH->fetch()) {
			list($tempIDs) = $this->getItemParentIDs( $row['itemID'] );
			$this->pastIDs = array_merge($this->pastIDs, $tempIDs);
		}
		$this->pastIDs = array_values(array_unique( $this->pastIDs )); // all id's for past and current purchases

		// Iterate through ID's and grab items or pass objects through
		$retData = array();
		foreach ($_SESSION['cart'] as $itemID) {
			if (is_string($itemID)) {
				$item = $this->getItemByID( $itemID );
				if ($item != null) array_push($retData, $item);
			} else { // format cost for carts
				$cost = $itemID['cost'];
				$itemID['cost'] = array(
					'pretty' => '$' . sprintf('%01.2f', $cost),
					'settings' => array(
						"cost" => $cost
					)
				);
				array_push($retData, $itemID);
			}
		}
		return $retData;
	}
	private function getAllCartParentIDs() { // Helper(get, add discount) remove invoices and grab parent id's
		$cleanIDs = array();
		foreach($_SESSION['cart'] as $itemID)
			if (is_string($itemID))
				array_push($cleanIDs, $itemID);
		$cartIDs = array('0'); // Grab parents of all items in cart (current purchases)
		foreach( $cleanIDs as $itemID ) {
			list($tempIDs) = $this->getItemParentIDs( $itemID );
			$cartIDs = array_merge($cartIDs, $tempIDs);
		}
		$cartIDs = array_values(array_unique( $cartIDs ));
		return array( $cartIDs, trim(str_repeat("?,", count($cartIDs)),",") );
	}
	private function getItemParentIDs( $itemID ) { // Helper(get,getAllCartParentIDs,getProductFields,getItemByID): return array of item's parent id's
		$STH = $this->db->prepare("SELECT parentID FROM item WHERE itemID=?;");
		$ids = array();
		do {
			array_push($ids, $itemID);
			if (!$STH->execute( $itemID )) die($this->conflict());
			$itemID = $STH->fetchColumn(0);
		} while (!is_null($itemID));
		return array( $ids, trim(str_repeat("?,", count($ids)),",") ); // ids, question marks
	}
	private function getItemByID( $itemID ) { // Helper(get): return specific item detail by id
		$user = $this->usr->currentUser();
		$itemSTH = $this->db->prepare("SELECT * FROM `item` WHERE itemID = ?;");
		if (!$itemSTH->execute( $itemID )) return -1;
		$row = $itemSTH->fetch();
		if (!isset($row['itemID'])) return null; // if can't find product
		$row['settings'] = json_decode($row['settings']);

		// check if item has options
		list($parentIDs, $marks) = $this->getItemParentIDs( $row['itemID'] );
		$STH = $this->db->prepare("SELECT count(*) FROM (SELECT * FROM item WHERE itemID IN ($marks)) i JOIN tie t ON t.itemID=i.itemID;");
		if (!$STH->execute( $parentIDs )) die($this->conflict());
		$row['hasOptions'] = $STH->fetchColumn() > 0;

		// find least price
		$costRows = $this->getAllItemCosts( $row['itemID'] ); // Recursive: returns all costs
		if (count($costRows) > 0) {
			$origRow = null; $origCost = null;
			$leastRow = null; $leastCost = null;
			foreach ($costRows as &$costRow) { // search for least
				$myCost = $this->getRowCost( $costRow );
				if ($myCost < $leastCost || is_null($leastCost)) { // get least
					$leastCost = $myCost;
					$leastRow = $costRow;
				}
				if ( is_null($costRow['reasonID']) && ( $myCost < $origCost || is_null($origCost) ) ) { // get least origional
					$origCost = $myCost;
					$origRow = $costRow;
				}
			}
			$leastRow['settings'] = (array)json_decode($leastRow['settings']);
			$leastRow['text'] =  $this->interpolate2($leastRow['pretty'], $leastRow['settings']);
			$row['cost'] = $leastRow;
			if ($leastRow != $origRow) $row['cost']['full'] = (array)json_decode($origRow['settings']);
		}
		// START DEV
		$row['cost2'] = $costRows; // debugging
		// END DEV

		// warn if item has already been purchased
		$checkSTH = $this->db->prepare("SELECT * FROM purchase WHERE itemID=? AND (contactID=? OR firmID=?);"); // in progress
		$checkSTH->execute( $itemID, $user['contactID'], $user['firmID'] );
		$checkData = $checkSTH->fetchAll(  );
		$row['warn'] = (count($checkData) > 0);
		if ($row['warn']) $row['oldData'] = json_decode( $checkData[0]['data'] );

		return $row;
	}
	private function getAllItemCosts( $itemID, $STH = null ) { // Helper(get): return cost for a productID

		$pastCommas = trim(str_repeat("?,", count($this->pastIDs)),","); // build string of question marks

		$query  = "SELECT i.parentID as parentID, r.name as reason, t.*, p.* FROM (SELECT * FROM item WHERE itemID=?) i ";
		$query .= "LEFT JOIN (";
		$query .= "  SELECT * FROM price WHERE reasonID IS NULL or reasonID IN ($pastCommas)"; // past purchases
		$query .= "  UNION";
		$query .= "  SELECT * FROM price WHERE reasonID IN ({$this->cartMarks}) AND inCart='true'"; // in cart
		$query .= ") p ON i.itemID=p.itemID ";
		$query .= "LEFT JOIN template t ON i.templateID=t.templateID ";
		$query .= "LEFT JOIN item r ON r.itemID=p.reasonID ";

		$STH = $this->db->prepare( $query );
		$allCosts = array();
		do {
			if (!$STH->execute( array_merge( array($itemID), $this->pastIDs, $this->cartIDs) )) die($this->conflict());
			$costs = $STH->fetchAll();
			if (!is_null($costs[0]['settings'])) $allCosts = array_merge($allCosts, $costs);
			$itemID = $costs[0]['parentID'];
		} while (!is_null($itemID));
		return $allCosts;
	}
	private function getRowCost( $row ) {
		if (is_null($row)) return INF; // needed?
		$cost = (array)json_decode($row['settings']); // parse settings out to compare
		$myCost = INF;
		$costReq = explode(',', $row['costReq']); // explode costReq
		if (isset($cost[ $costReq[0] ])) $myCost = $cost[ $costReq[0] ]; // cost based on first requirement
		return $myCost;
	}

	// Worker: remove element from cart
	public function rem() {
		$data = $this->getPostData();

		if ($data->itemID == -1) { // wierd thing to make custom payments work
			$data->cost = $data->cost->settings->cost; // clean cost
			unset($data->hasOptions); // drop hasOptions

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

	// Worker / Helper: (helper for getOption, will work for cb.php)
	public function addItem($itemID) {
		$pass = false;
		if (false===array_search($itemID, $_SESSION['cart'])) {
			array_push($_SESSION['cart'], $itemID);
			$pass = true;
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

		$this->addItem($data->itemID);

		$item = $this->getItemByID( $data->itemID ); // get item + cost information
		$fields = $this->getProductFields( $item['itemID'] ); // get fields for a product
		if ($fields == -1) return $this->conflict();

		$item = is_null( $item ) ? array( 'name'=>'Not Found' ) : $item ; // account for empty case
		$options = isset($_SESSION['cart.options'][$data->itemID]) ? $_SESSION['cart.options'][$data->itemID] : new stdClass(/*empty obj*/) ;
		return array(
			'item' => $item,
			'fields' => $fields,
			'options' => $options
		);
	}
	private function getProductFields( $itemID ) { // Helper: return question's options
		list($ids, $marks) = $this->getItemParentIDs( $itemID );
		$STH = $this->db->prepare("SELECT f.*, t.required FROM tie t JOIN field f ON f.fieldID=t.fieldID WHERE itemID in ($marks) ORDER BY `order`;");
		if (!$STH->execute( $ids )) return -1; // on error

		$retData = $STH->fetchAll();
		foreach ($retData as &$item) $item['settings'] = json_decode($item['settings']); // Decode those settings!
		return $retData;
	}

	// Worker: set cart options
	public function setOption() {
		$data = $this->getPostData();
		$_SESSION['cart.options'][ $data->item->itemID ] = (gettype($data->options) == 'object') ? $this->object_to_array( $data->options ) : $data->options ;
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
		$codeSTH = $this->db->prepare("SELECT * FROM `discount` WHERE `code`=?;");
		if (!$codeSTH->execute( $data->code )) return $this->conflict();
		$discount = $codeSTH->fetch();
		if ($discount == false) return $this->conflict('inv'); // is not code
		if ($discount['active'] != 'yes') return $this->conflict('exp'); // is expired

		// server duplicate check
		foreach ($_SESSION['cart.discounts'] as $myDiscount)
			if ($myDiscount['discountID'] == $discount['discountID']) return $this->conflict('dup'); // is duplicate

		// test if valid for current cart
		list($ids, $questionMarks) = $this->getAllCartParentIDs();
		$params = array_merge($ids, array($discount['discountID']));
		$chkSTH = $this->db->prepare("SELECT count(*) FROM discount WHERE (itemID IN ($questionMarks) OR itemID IS NULL) AND discountID=?;");
		if (!$chkSTH->execute( $params ) || $chkSTH->fetchColumn() < 0) return $this->conflict('unr'); // is unrelated

		// store and return new discount
		array_push($_SESSION['cart.discounts'], $discount);
		return $discount;
	}

	// Helper: check discounts agains removed item
	private function chkDiscounts() {
		list($ids, $questionMarks) = $this->getAllCartParentIDs();
		$chkSTH = $this->db->prepare("SELECT count(*) FROM discount WHERE (itemID IN ($questionMarks) OR itemID IS NULL) AND discountID=?;");
		foreach ($_SESSION['cart.discounts'] as $discount) 
			if (!$chkSTH->execute( array_merge($ids, array($discount['discountID'])) ) || $chkSTH->fetchColumn() < 0) 
				$this->remDiscount( $discount );
	}

	// GENERIC CART FUNCTION

	// Worker(app/checkout): save cart
	public function save() {
		// $user = $this->usr->requiresAuth();
		// $data = $this->getPostData();

		// // Insert order
		// $orderSTH = $this->db->prepare("INSERT INTO `order` (contactID, medium, amount) VALUES (?,?,?);");
		// if (!$orderSTH->execute( $user['contactID'], $data->medium, $data->cost )) return $this->conflict();
		// $orderID = $this->db->lastInsertId();

		// // Store purchases and options
		// $purchaseSTH = $this->db->prepare("INSERT INTO `purchase` (itemID, orderID, firmID, `data`) VALUES (?,?,?,?) ON DUPLICATE KEY UPDATE orderID=VALUES(orderID), `data`=VALUES(`data`);");
		// $acquisitionSTH = $this->db->prepare("INSERT INTO `acquisition` (itemID, orderID) VALUES (?,?);");
		// $attendeeSTH = $this->db->prepare("INSERT INTO `attendee` (itemID, contactID, orderID) VALUES (?,?,?);");
		// $memberSTH = $this->db->prepare("INSERT INTO `member` (firmID, groupID) VALUES (?,?);");
		// $cart = $this->get(); // removes random id's
		// foreach ($cart as $item) { // iterate over items
		// 	if ($item['itemID'] == '-1') continue; // don't care about custom payment storage (yet)
		// 	$option = isset($_SESSION['cart.options'][ $item['itemID'] ]) ? $_SESSION['cart.options'][ $item['itemID'] ] : array(); // get item's object

		// 	if (isset($option['attID'])) { // store attendees
		// 		foreach($option[$option['attID']] as &$contact) {
		// 			if (!$attendeeSTH->execute($item['itemID'], $contact['contactID'], $orderID)) return $this->conflict();
		// 			$contact['attendeeID'] = $this->db->lastInsertId();
		// 		}
		// 	}

		// 	if ($item['type'] == 'purchase') { // store groups / acquisition
		// 		if (isset($item['settings']->groupID)) { // store groups
		// 			if (!$memberSTH->execute($user['firmID'], $item['settings']->groupID)) return $this->conflict();
		// 			$option['memberID'] = $this->db->lastInsertId();
		// 		}
		// 		if (!$purchaseSTH->execute($item['itemID'], $orderID, $user['firmID'], json_encode($option))) return $this->conflict(); // purchase
		// 	} else {
		// 		if (!$acquisitionSTH->execute($item['itemID'], $orderID)) return $this->conflict(); // acquisition
		// 		// $option['acquisitionID'] = $this->db->lastInsertId();
		// 	}
		// }

		// $this->emailCart($orderID);
		// $this->clr();

		// return $orderID;	
	}

	// Worker(app/purchases): return purchases
	public function getPurchases() {
		$user = $this->usr->requiresAuth();

		$itemSTH = $this->db->prepare("SELECT * FROM (SELECT * FROM purchase WHERE contactID=? OR firmID=?) p LEFT JOIN item i ON p.itemID=i.itemID LEFT JOIN 'order' o ON p.orderID=o.orderID;");

		$itemSTH->execute( $user['contactID'], $user['firmID'] );

		$retData = $itemSTH->fetchAll();
		foreach ($retData as &$item) {
			$item['template'] = $this->getItemTemplate( $item['itemID'] );
			$item['settings'] = json_decode($item['settings']);
			$item['data'] = json_decode($item['data']);
		}
		return $retData;
	}
	private function getItemTemplate( $itemID ) { // Helper (getPurchases);
		$template = null;
		$STH = $this->db->prepare("SELECT * FROM (SELECT parentID,templateID FROM item WHERE itemID=?) i LEFT JOIN template t ON i.templateID=t.templateID;");
		do {
			if (!$STH->execute($itemID)) die($this->conflict());
			$row = $STH->fetch();
			if ($row == false) die($this->conflict());
			$itemID = $row['parentID'];
			if (!is_null($row['templateID'])) {
				unset($row['parentID']);
				$template = $row;
				$itemID = null;
			}
		} while (!is_null($itemID));
		return $template;
	}

	// Helper(app/cart/checkout/email): email cart data
	public function emailCart($orderID) {
		// // grab order info
		// $orderSTH = $this->db->prepare("SELECT * FROM `order` WHERE `orderID`=? LIMIT 1;");
		// $orderSTH->execute( $orderID );
		// $order = $orderSTH->fetch();

		// // grab contact info
		// $contactSTH = $this->db->prepare("SELECT c.firmID, c.legalName, c.preName, c.title, c.email, c.phone, a.* FROM `contact` c LEFT JOIN `address` a ON c.addressID=a.addressID WHERE `contactID`=? LIMIT 1;");
		// $contactSTH->execute( $order['contactID'] );
		// $contact = $contactSTH->fetch();

		// // grab contacts firm info
		// $firmSTH = $this->db->prepare("SELECT f.name, f.website, a.* FROM `firm` f LEFT JOIN `address` a on f.addressID=a.addressID WHERE firmID=? LIMIT 1;");
		// $firmSTH->execute( $contact['firmID'] );
		// $firm = $firmSTH->fetch();

		// // grab order
		// $q[] = "SELECT `data`, itemID, orderID FROM `purchase`";
		// $q[] = "SELECT '{}' as `data`, itemID, orderID FROM `acquisition`";
		// $q = implode(" UNION ", $q);
		// $itemsSTH = $this->db->prepare("SELECT p.`data`, i.* FROM ($q) AS `p` LEFT JOIN `item` i ON p.itemID=i.itemID WHERE orderID=?;");
		// $itemsSTH->execute( $orderID );
		// $items = $itemsSTH->fetchAll();

		// // setup attendees grab
		// $attendeeSTH = $this->db->prepare("SELECT c.legalName, c.preName, c.title, c.email, c.phone, d.* FROM (SELECT contactID FROM `attendee` a WHERE itemID=?) a LEFT JOIN `contact` c ON a.contactID=c.contactID LEFT JOIN `address` d ON c.addressID=d.addressID;");
		// $fieldSTH = $this->db->prepare("SELECT * FROM `field` WHERE fieldID=? LIMIT 1;");

		// // Pretty print addresses
		// function address($data) {
		// 	$str  = "{$data['addr1']}<br />\r\n";
		// 	if ($data['addr2']!='') 
		// 		$str .= "{$data['addr2']}<br />\r\n";
		// 	$str .= "{$data['city']} {$data['state']}, {$data['zip']}<br />\r\n";
		// 	return $str;
		// }

		// setlocale(LC_MONETARY, 'en_US');
		// $order['amount'] = '$' . money_format('%n', $order['amount']);

		// // pretty print data for email
		// $html  = "<b>Order#:</b> $orderID<br />\r\n";
		// $html .= "<b>Status / medium:</b> {$order['status']} / {$order['medium']}<br />\r\n";
		// $html .= "<b>Time:</b> {$order['stamp']}<br />\r\n";
		// $html .= "<b>Total:</b> {$order['amount']}<br />\r\n";
		// $html .= "<hr/><b>Purchase Contact:</b><br />\r\n";
		// $html .= "<a href=\"mailto:{$contact['email']}\" >{$contact['title']} {$contact['legalName']} ({$contact['preName']})</a><br />\r\n";
		// $html .= address($contact);
		// $html .= "Phone: <a href=\"tel:{$contact['phone']}\">{$contact['phone']}</a><br />\r\n";
		// $html .= "<hr/><b>Purchase Firm:</b><br />\r\n";
		// $html .= "<a href=\"{$firm['website']}\">{$firm['name']}</a><br />\r\n";
		// $html .= address($firm);
		// $html .= "<hr/>Items:<br /><ul>\r\n";

		// $mail = new UAMail();
		// $files = array();
		// // $mail->SMTPDebug  = 2;

		// foreach ($items as $item) {

		// 	$html .= (isset($item['url'])) ? "<li><a href=\"{$item['url']}\">{$item['name']}</a><ul>" : "<li><strong>{$item['name']}</strong><ul>";
		// 	$data = json_decode($item['data']);
		// 	foreach ($data as $key => $value) {
		// 		$fieldSTH->execute( $key );
		// 		if ($fieldSTH->rowCount() > 0) {
		// 			$fieldData = $fieldSTH->fetch();

		// 			// special question formatters
		// 			switch ($fieldData['fieldID']) {
		// 				case '2':
		// 					$value = '$' . money_format('%n', $value);
		// 					break;
		// 			}

		// 			// type display
		// 			switch ($fieldData['type']) {
		// 				case 'attendees': // pretty print attendees
		// 					$html .= "<li><b>Attendee(s):</b><ul>";
		// 					$attendeeSTH->execute( $item['itemID'] );
		// 					while ($row = $attendeeSTH->fetch(  )) {
		// 						$html .= "<li>";
		// 						$html .= "<a href=\"mailto:{$row['email']}\" >{$row['title']} {$row['legalName']} ({$row['preName']})</a><br />\r\n";
		// 						$html .= address($row);
		// 						$html .= "Phone: <a href=\"tel:{$row['phone']}\">{$row['phone']}</a><br />\r\n";
		// 						$html .= "</li>";
		// 					}
		// 					$html .= "</ul></li>";
		// 					break;

		// 				case 'image':
		// 					$fileName = $firm['name'] . ', ' . $contact['legalName'] . '.' . pathinfo($value, PATHINFO_EXTENSION);
		// 					$mail->addAttachment($_SERVER['DOCUMENT_ROOT'].$value, $fileName);
		// 					$html .= "<li><b>" . $fieldData['name'] . ':</b>' . $fileName . "</li>";
		// 					array_push($files, $_SERVER['DOCUMENT_ROOT'] . $value);
		// 					break;

		// 				default:
		// 					$html .= "<li><b>" . $fieldData['name'] . ':</b> ' . $value . "</li>";
		// 					break;
		// 			}
		// 		}
		// 	}
		// 	$html .= "</ul></li>";
		// }

		// $html .= "</ul>\r\n";

		// $mail->addAddress(config::notifyEmail, config::notifyName);
		// $mail->Subject = "UpstreamAcademy Checkout";
		// $mail->Body    = $html;
		// $mail->AltBody = strip_tags($html);
		// if (!$mail->send()) {
		// 	$this->conflict('mail');
		// } else {
		// 	foreach ($files as $file) unlink($file); // delete sent files
		// }
	}
}