<?php

class Discount extends NG {

	// Constructor: Initialize session and db connections
	function __construct() {
		parent::__construct();
	}

	public static function process( $action, &$pass, &$data ) {
		echo 'inDiscount';
		$obj = new Discount();
		
		switch ( $action ) {
			// Discount Functions
			case 'getDiscountData':   $data = $obj->getDiscountData();   break;
			case 'remDiscount':       $data = $obj->remDiscount();       break;
			case 'setDiscount':       $data = $obj->setDiscount();       break;
			case 'setDiscountActive': $data = $obj->setDiscountActive(); break;

			default: $pass = false;
		}
	}

	// ----
	// Discount Funcitons
	// ----

	// Worker(disocunts): returns all discounts
	public function getDiscountData() {
		$disSTH = $this->db->query("SELECT d.*,IFNULL(q.name,p.name) AS productName,i.name AS itemName FROM `discount`d LEFT JOIN `item`i ON d.itemID = i.itemID LEFT JOIN `product`p ON d.productID=p.productID LEFT JOIN `product`q ON q.productID=i.productID;");
		$prodSTH = $this->db->query("SELECT `productID`, `name` FROM `product` ORDER BY `name`;");
		$itemSTH = $this->db->query("SELECT `itemID`, `productID`, `name` FROM `item` ORDER BY `name`;");
		return array(
			'discounts' => $disSTH->fetchAll( PDO::FETCH_ASSOC ),
			'products' => $prodSTH->fetchAll( PDO::FETCH_ASSOC ),
			'items' => $itemSTH->fetchAll( PDO::FETCH_ASSOC )
		);
	}

	// Worker(discounts): assigns discont activness
	public function setDiscountActive() {
		$data = $this->getPostData();
		$STH = $this->db->prepare("UPDATE `discount` SET `active`=? WHERE `discountID`=?;");
		if (!$STH->execute($data->active, $data->discountID)) return $this->conflict();
		return $data;
	}

	// Worker(discount): removes discount from db
	public function remDiscount() {
		$data = $this->getPostData();
		$STH = $this->db->prepare("DELETE FROM `discount` WHERE `discountID`=? LIMIT 1;");
		if (!$STH->execute($data->discountID)) return $this->conflict();
		return $data;
	}

	// Worker(discount): stores discount changes
	public function setDiscount() {
		$d = $this->getPostData();
		if (isset($d->discountID)) {
			$STH = $this->db->prepare("UPDATE `discount` SET `name`=?,`code`=?,`amount`=?,`itemID`=?,`productID`=? WHERE `discountID`=?;");
			if ( !is_null($d->itemID) && !is_null($d->productID) )  $productID = null; // clear productID on save
			if (!$STH->execute($d->name, $d->code, $d->amount, $d->itemID, $d->productID, $d->discountID)) return $this->conflict();
		} else {
			$STH = $this->db->prepare("INSERT INTO `discount` (`itemID`,`productID`,`name`,`code`,`amount`,`active`) VALUES (?,?,?,?,?,'yes');");
			if (!$STH->execute($d->itemID, $d->productID, $d->name, $d->code, $d->amount)) return $this->conflict();
			$d = (object) array_merge( (array)$foo, array('discountID' => $this->db->lastInsertId()) );
		}
		return $d;
	}
}