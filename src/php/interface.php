<?php

// Handle cross site stuff (for development)
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') { exit(0); }

require_once('./libinc/main_include.php');

/*
 *  Application Class (conditionally run script subsets)
 * ------------------------------------------------------- */

class formsManager extends NgClass {
	private $db;

	// Constructor: Initialize session and db connections
	function __construct() {
		parent::__construct();
		$this->db = new myPDO();
	}

	// Worker(security): Implements Abstract: returns database user object or null
	protected function getUser( $data ) {
		$user = NULL;

		$STH = $this->db->prepare("SELECT * FROM `contact` WHERE `email`=? AND `pass`=ENCRYPT(?,?) LIMIT 1;");
		$STH->execute( $data->email, $data->password, config::encryptSTR );
		if ( $STH->rowCount() > 0 ) {
			$user = $STH->fetch( PDO::FETCH_ASSOC );
			$user['admin'] = $user['isAdmin'] == 'yes';
			unset( $user['pass'], $user['resetHash'], $user['resetExpires'], $user['isAdmin'] );

			$updateSTH = $this->db->prepare( "UPDATE `contact` SET lastLogin=NOW() WHERE `contactID`=?;" );
			$updateSTH->execute( $user['contactID'] );
		}
		return $user;
	}

	// Worker(test): tests if user is authenticated
	public function testAuth() {
		$this->requiresAuth();
		return 'hello authenticated user';
	}

	// Worker(test): tests if user is administrator
	public function testAdmin() {
		$this->requiresAdmin();
		return 'hello administrator user';
	}

	// Main application funcitons

	// Worker(app): returns product list
	public function getProducts() {
		$STH = $this->db->query("SELECT * FROM `product` WHERE visible='yes';");
		return json_encode($STH->fetchAll(PDO::FETCH_ASSOC));
	}

	// Helper(app): returns interpolated item (see: https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-3-logger-interface.md)
	private function interpolate( $message, array $context = array()) {
		// build a replacement array with braces around the context keys
		$replace = array();
		foreach ($context as $key => $val) {
			$replace['{' . $key . '}'] = $val;
		}

		// interpolate replacement values into the message and return
		return strtr($message, $replace);
	}

	// Helper(app): return cost for a productID
	private function getProductCost( $productID ) {
		$user = $this->getCurrentUser();

		// pull groups based on firmID if user is assigned
		$groups = array();
		if ($user != null) {
			$groupSTH = $this->db->prepare("SELECT groupID FROM `member` WHERE firmID=?;");
			$groupSTH->execute( $user['firmID'] );
			$groups = $groupSTH->fetchAll( PDO::FETCH_COLUMN );
		}
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
				default: $pretty[$key] = money_format('%n', $value); break;
			}
		}

		return array(
			'pretty' => $this->interpolate($leastRow['pretty'], $pretty),
			'settings' => $subs
		);
	}

	// Worker(app): returns item list
	public function getItems() {
		$data = $this->getPostData();

		// Get cost for all the items
		$cost = $this->getProductCost( $data->prodID );

		// Get All the items
		$itemSTH = $this->db->prepare("SELECT i.*, template FROM (SELECT * FROM `item` WHERE productID=? AND visible='yes') i LEFT JOIN `product` p ON p.productID=i.productID LEFT JOIN `template` t ON p.templateID=t.templateID;");
		$itemSTH->execute( $data->prodID );

		// Properly pre-format return data
		$retData = $itemSTH->fetchAll(PDO::FETCH_ASSOC);
		foreach ($retData as &$item) {
			$item['settings'] = json_decode($item['settings']);
			$item['cost'] = $cost;
		}

		return json_encode($retData);
	}

	// Worker(app/breadcrumb): return full name for breadcrumb
	public function prettyCrumb() {
		$data = $this->getPostData();

		$ret = ucfirst($data->name);

		// Pretty print product area
		if ( preg_match('/#\/products\/.*/', $data->path) && $data->index > 0 && $data->index < 3 ) {
			if ( $data->index == 1 ) {
				$STH = $this->db->prepare("SELECT `name` FROM `product` WHERE `productID`=?;");
			} else { // has to be 2
				$STH = $this->db->prepare("SELECT `name` FROM `item` WHERE `itemID`=?;");
			}
			$STH->execute( $data->name );
			$ret = $STH->fetchColumn();
		}

		return $ret;
	}

	// Worker(app): return specific item detail
	public function getItem() {
		$data = $this->getPostData();
		// die(print_r($data, true));
		return json_encode($this->getItemByID($data->itemID));
	}

	// Helper(app): return specific item detail by id
	private function getItemByID( $itemID ) {
		// $itemSTH = $this->db->prepare("SELECT i.*, t.template FROM (SELECT * FROM `item` WHERE itemID = ?) i JOIN product p ON p.productID=i.productID JOIN template t ON t.templateID = p.templateID;");
		$itemSTH = $this->db->prepare("SELECT i.*, t.template, COUNT(f.tiePFID) as `options` FROM (SELECT * FROM `item` WHERE itemID = ?) i JOIN product p ON p.productID=i.productID JOIN template t ON t.templateID = p.templateID LEFT JOIN `tie_product_field` f ON f.productID = i.productID GROUP BY i.itemID, i.productID, i.name, i.description, i.settings, i.img, i.blurb, t.template;");
		// $itemSTH = $this->db->prepare("SELECT * FROM `item` WHERE itemID = ?;");
		$itemSTH->execute( $itemID );
		$row = $itemSTH->fetch(PDO::FETCH_ASSOC);
		if (!isset($row['productID'])) {
			return null;
		}
		$row['settings'] = json_decode($row['settings']);
		$row['cost'] = $this->getProductCost( $row['productID'] );
		return $row;
	}

	// Worker(app): return cart with current prices
	public function getCart() {
		$user = $this->requiresAuth(); // upon cart completion
		$data = $this->getPostData();

		$STH = $this->db->prepare("SELECT purchaseID FROM `purchase` WHERE firmID=? and itemID=?;");

		// remove all non-strings to allow invoices, but still grab purchase id's
		$cleanIDs = array();
		foreach($data->ids as $itemID) if (is_string($itemID)) array_push($cleanIDs, $itemID);

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
		foreach ($data->ids as $itemID) {
			if (is_string($itemID)) {
				$item = $this->getItemByID( $itemID );
				if ($item != null) {

					// warn if item has already been purchased
					$STH->execute( $user['firmID'], $itemID );
					$item['warn'] = ($STH->rowCount() > 0);

					array_push($retData, $item);
				}
			} else {
				array_push($retData, $itemID);
			}

		}

		return json_encode($retData);
	}

	// Worker(app/user): add an address to the database
	public function addAddress() {
		$data = $this->getPostData();

		$STH = $this->db->prepare("INSERT INTO `address` (addrName, addr1, addr2, city, state, zip) VALUES (?,?,?,?,?,?);");
		if (!$STH->execute( $data->addrName, $data->addr1, $data->addr2, $data->city, $data->state, $data->zip )) {
			header('HTTP/ 409 Conflict');
			print_r($STH->errorInfo());
		}

		return $this->db->lastInsertId();
	}

	// Worker(app/user): add an address to the database
	public function editAddress() {
		$data = $this->getPostData();

		$STH = $this->db->prepare("UPDATE `address` SET addrName=?, addr1=?, addr2=?, city=?, state=?, zip=? WHERE addressID=?;");
		if (!$STH->execute( $data->addrName, $data->addr1, $data->addr2, $data->city, $data->state, $data->zip, $data->addrID )) {
			header('HTTP/ 409 Conflict');
			print_r($STH->errorInfo());
		}

		return $data->addrID;
	}

	// Worker(app/user): register a user to the database
	public function addUser() {
		$data = $this->getPostData();

		// check to see if user is already in system (email)
		$checkSTH = $this->db->prepare("SELECT * FROM `contact` WHERE email=?;");
		if (!$checkSTH->execute($data->email)) {
			header('HTTP/ 409 Conflict');
			return print_r($STH->errorInfo(), true);
		}
		if ($checkSTH->rowCount() > 0) {
			header('HTTP/ 409 Conflict');
			return 'dup';
		}

		// Add firm
		$firmSTH = $this->db->prepare("INSERT INTO `firm` (addressID, name, website) VALUES (?,?,?);");
		if (!$firmSTH->execute( $data->firm->addr->addrID, $data->firm->name, $data->firm->website )) {
			header('HTTP/ 409 Conflict');
			return print_r($STH->errorInfo(), true);
		}
		$firmID = $this->db->lastInsertId();

		// Add Contact
		$contSTH = $this->db->prepare("INSERT INTO `contact` (firmID, addressID, legalName, preName, title, email, phone, pass) VALUES (?,?,?,?,?,?,?,ENCRYPT(?,?));");
		if (!$contSTH->execute( $firmID, $data->addr->addrID, $data->legalName, $data->preName, $data->title, $data->email, $data->phone, $data->password, config::encryptSTR )) {
			header('HTTP/ 409 Conflict');
			return print_r($STH->errorInfo(), true);
		}

		session_start();
		$_SESSION['user'] = $this->getUser( $data );
		return $this->db->lastInsertId();
	}

	// Worker(app/checkout): return firms address
	public function getFirmAddr() {
		$user = $this->requiresAuth();

		$STH = $this->db->prepare("SELECT a.* FROM `firm` f JOIN `address` a ON f.addressID=a.addressID WHERE f.firmID=?;");
		$STH->execute( $user['firmID'] );

		return json_encode( $STH->fetch(PDO::FETCH_ASSOC) );
	}

	// Worker(app/checkout): return firms employees
	public function getFirmEmploy() {
		$user = $this->requiresAuth();

		$STH = $this->db->prepare("SELECT * FROM `contact` WHERE `firmID`=?;");
		$STH->execute( $user['firmID'] );

		// Clear sensitive data
		$retData = $STH->fetchAll(PDO::FETCH_ASSOC);
		foreach ($retData as &$item) {
			unset( $item['pass'], $item['resetHash'], $item['resetExpires'], $item['isAdmin'], $item['lastLogin'] );
		}
		return json_encode($retData);
		// return json_encode( $STH->fetchAll(PDO::FETCH_ASSOC) );
	}

	// Worker(app/checkout): add contact to system
	public function addContact() {
		$user = $this->requiresAuth();
		$data = $this->getPostData();

		$STH = $this->db->prepare("INSERT INTO `contact` (firmID, addressID, legalName, preName, title, email, phone) VALUES (?,?,?,?,?,?,?);");
		if (!$STH->execute( $user['firmID'], $data->addr->addressID, $data->legalName, $data->preName, $data->title, $data->email, $data->phone )) {
			header('HTTP/ 409 Conflict');
			return print_r($STH->errorInfo(), true);
		}

		return $this->db->lastInsertId();
	}

	// Worker(app/checkout): add contact to system
	public function editContact() {
		$user = $this->requiresAuth();
		$data = $this->getPostData();

		$STH = $this->db->prepare("UPDATE `contact` SET addressID=?, legalName=?, preName=?, title=?, email=?, phone=? WHERE contactID=?;");
		if (!$STH->execute( $data->addr->addressID, $data->legalName, $data->preName, $data->title, $data->email, $data->phone, $data->contactID )) {
			header('HTTP/ 409 Conflict');
			return print_r($STH->errorInfo(), true);
		}

		return $data->contactID;
	}

	// Worker(app/checkout): return question's options
	public function getItemOptions() {
		$data = $this->getPostData();

		$STH = $this->db->prepare("SELECT f.* FROM `tie_product_field` t JOIN `field` f ON f.fieldID = t.fieldID WHERE productID=? ORDER BY `order`;");
		if (!$STH->execute( $data->productID )) {
			header('HTTP/ 409 Conflict');
			return print_r($STH->errorInfo(), true);
		}

		// Decode those settings!
		$retData = $STH->fetchAll(PDO::FETCH_ASSOC);
		foreach ($retData as &$item) {
			$item['settings'] = json_decode($item['settings']);
		}
		return json_encode($retData);
	}

	// Worker(app/checkout): save cart
	public function saveCart() {
		$user = $this->requiresAuth();
		$data = $this->getPostData();

		// Insert order
		$orderSTH = $this->db->prepare("INSERT INTO `order` (contactID, medium) VALUES (?,?);");
		if (!$orderSTH->execute( $user['contactID'], $data->medium )) {
			header('HTTP/ 409 Conflict');
			return print_r($orderSTH->errorInfo(), true);
		}
		$orderID = $this->db->lastInsertId();

		// Store purchases and options
		$purchaseSTH = $this->db->prepare("INSERT INTO `purchase` (itemID, orderID, firmID, data) VALUES (?,?,?,?);");
		$attendeeSTH = $this->db->prepare("INSERT INTO `attendee` (itemID, contactID) VALUES (?,?);");
		$memberSTH = $this->db->prepare("INSERT INTO `member` (firmID, groupID) VALUES (?,?);");
		foreach ($data->items as $key => $value) { // iterate over items
			if (isset($value->opt->attendees)) { // Store attendees here (if possible)
				foreach ($value->opt->attendees as $contactID) {
					if (!$attendeeSTH->execute($key, $contactID)) {
						header('HTTP/ 409 Conflict');
						return print_r($orderSTH->errorInfo(), true);
					}
				}
				unset($value->opt->attendees);
			}
			if (isset($value->ele->settings->groupID)) {
				if (!$memberSTH->execute($user['firmID'], $value->ele->settings->groupID)) {
					header('HTTP/ 409 Conflict');
					return print_r($orderSTH->errorInfo(), true);
				}
			}
			if (!$purchaseSTH->execute($key, $orderID, $user['firmID'], json_encode($value->opt))) { // store purchase here
				header('HTTP/ 409 Conflict');
				return print_r($orderSTH->errorInfo(), true);
			}
		}

		return $orderID;	
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

	// Worker(app/purchases/all): return purchases (not needing auth)
	public function getSoftPurchases() {
		$retData = array();

		$user = $this->getCurrentUser();
		if (!is_null($user)) {
			$STH = $this->db->prepare("SELECT itemID FROM `purchase` WHERE firmID=?;");
			$STH->execute( $user['firmID'] );
			$retData = $STH->fetchAll( PDO::FETCH_COLUMN );
		}

		return json_encode($retData);
	}

	// Worker(app/cart/discount): return discount object
	public function getDiscount() {
		$user = $this->requiresAuth();
		$data = $this->getPostData();

		// Check if any code matches the inputed code
		$anyCodeSTH = $this->db->prepare("SELECT discountID FROM `discount` WHERE `code`=?;");
		if (!$anyCodeSTH->execute( $data->code ) || $anyCodeSTH->rowCount() == 0) {
			return json_encode(array('pre'=> 'Error!','msg'=>'Invalid discount code.', 'type'=>'error'));
		}
		$codeID = $anyCodeSTH->fetchColumn();

		// Check if code is still valid
		$validTimeSTH = $this->db->prepare("SELECT * FROM `discount` WHERE `activate`<NOW() AND (`expire`>NOW() OR `expire` IS NULL) AND discountID=?;");
		if (!$validTimeSTH->execute( $codeID ) || $validTimeSTH->rowCount() == 0) {
			return json_encode(array('pre' => 'Sorry!', 'msg'=>'This code has expired!', 'type'=>'error'));
		}

		// TODO: test if valid for current cart
		$questionMarks = trim(str_repeat("?,", sizeof($data->ids)),",");
		$finalSTH = $this->db->prepare("SELECT * FROM `discount` WHERE ((productID IN (SELECT DISTINCT productID FROM `item` WHERE itemID IN ($questionMarks)) AND itemID IS NULL) OR (productID IS NULL AND itemID IN ($questionMarks)) OR (productID IS NULL AND itemID IS NULL) ) AND discountID = ?;");
		if (!$finalSTH->execute( array_merge( $data->ids, $data->ids, array($codeID) ) ) || $finalSTH->rowCount() == 0) {
			return json_encode(array('pre' => 'Unrelated!', 'msg'=>'Not associated with any items in your cart.', 'type'=>'error'));
		}

		// successfull callback
		return json_encode(array(
			'pre'=> 'Success!',
			'msg'=>'Added discount to current order!',
			'type'=>'success',
			'obj'=>$finalSTH->fetch(PDO::FETCH_ASSOC)
		));
	}
}

/*
 *  Application Logic (fire methods depending on 'action')
 * ------------------------------------------------------- */

if (!isset($_REQUEST['action'])) $_REQUEST['action'] = 'nope';

$obj = new formsManager();
switch ($_REQUEST['action']) {
	case 'currentUser': echo $obj->currentUser(); break;
	case 'login': echo $obj->login(); break;
	case 'logout': echo $obj->logout(); break;

	// Main app functions
	case 'getProducts': echo $obj->getProducts(); break;
	case 'getItems': echo $obj->getItems(); break;
	case 'getCart': echo $obj->getCart(); break;
	case 'getItem': echo $obj->getItem(); break;
	case 'prettyCrumb': echo $obj->prettyCrumb(); break;

	// user registration functions
	case 'addAddress': echo $obj->addAddress(); break;
	case 'editAddress': echo $obj->editAddress(); break;
	case 'addUser': echo $obj->addUser(); break;

	// checkout functions
	case 'getFirmAddr': echo $obj->getFirmAddr(); break;
	case 'getFirmEmploy': echo $obj->getFirmEmploy(); break;
	case 'addContact': echo $obj->addContact(); break;
	case 'editContact': echo $obj->editContact(); break;
	case 'getItemOptions': echo $obj->getItemOptions(); break;
	case 'saveCart': echo $obj->saveCart(); break;
	case 'getDiscount': echo $obj->getDiscount(); break;

	// previous purchase functions
	case 'getPurchases': echo $obj->getPurchases(); break;
	case 'getSoftPurchases': echo $obj->getSoftPurchases(); break;

	// Test case statements
	case 'testAuth': echo $obj->testAuth(); break;
	case 'testAdmin': echo $obj->testAdmin(); break;
	case 'demo': 
		echo '<pre>'; 
		print_r($_REQUEST); 
		break;
	default: 
		header('HTTP/ 409 Conflict');
		die('Your Kung-Fu is not strong.');
}