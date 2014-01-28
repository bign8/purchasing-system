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
			case 'getDiscounts': $data = $obj->getDiscounts(); break;
			default: $pass = false;
		}
	}

	// Worker(disocunts): returns all discounts
	public function getDiscounts() {
		$STH = $this->db->query("SELECT * FROM `discount`;");
		return $STH->fetchAll( PDO::FETCH_ASSOC );
	}
}
