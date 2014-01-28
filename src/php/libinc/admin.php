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
			case 'getDiscounts':      $data = $obj->getDiscounts();      break;
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

	// Worker(discounts): assigns discont activness
	public function setDiscountActive() {
		$data = $this->getPostData();
		$STH = $this->db->prepare("UPDATE `discount` SET `active`=? WHERE `discountID`=?;");
		if (!$STH->execute($data->active, $data->discountID)) return $this->conflict();
		return $data;
	}
}