<?php

class Admin extends NG {

	private $usr;

	// Constructor: Initialize session and db connections
	function __construct() {
		parent::__construct();
		$this->usr = new User();
	}

	public static function process( $action, &$pass, &$data ) {
		$obj = new Admin();
		switch ( $action ) {
			// Discount Functions
			case 'getDiscount':       $data = $obj->getDiscount();       break;
			case 'getDiscounts':      $data = $obj->getDiscounts();      break;
			case 'remDiscount':       $data = $obj->remDiscount();       break;
			case 'setDiscountActive': $data = $obj->setDiscountActive(); break;

			default: $pass = false;
		}
	}

	// ----
	// Discount Funcitons
	// ----

	// Worker(disocunts): returns all discounts
	public function getDiscounts() {
		$STH = $this->db->query("SELECT d.*,q.name AS parent,IFNULL(i.name, p.name) AS display FROM `discount`d LEFT JOIN `item`i ON d.itemID = i.itemID LEFT JOIN `product`p ON d.productID=p.productID LEFT JOIN `product`q ON q.productID=i.productID;");
		return $STH->fetchAll( PDO::FETCH_ASSOC );
	}

	// Worker(discounts): returns single discount
	public function getDiscount() {
		$data = $this->getPostData();
		$STH = $this->db->prepare("SELECT d.*,q.name AS parent,IFNULL(i.name, p.name) AS display FROM `discount`d LEFT JOIN `item`i ON d.itemID = i.itemID LEFT JOIN `product`p ON d.productID=p.productID LEFT JOIN `product`q ON q.productID=i.productID WHERE d.discountID=?;");
		if (!$STH->execute($data->discountID)) $this->conflict();
		return $STH->fetch( PDO::FETCH_ASSOC );
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
}