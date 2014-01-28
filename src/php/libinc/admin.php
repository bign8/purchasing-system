<?php

class Admin extends NG {

	private $usr;

	// Constructor: Initialize session and db connections
	function __construct() {
		parent::__construct();
		$this->usr = new User();
	}

	// Worker(disocunts): returns all discounts
	public function getDiscounts() {
		$STH = $this->db->query("SELECT * FROM `discount`;");
		return $STH->fetchAll( PDO::FETCH_ASSOC );
	}
}
