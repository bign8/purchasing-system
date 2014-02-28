<?php

class Discount extends NG {

	// Constructor: Initialize session and db connections
	function __construct() {
		parent::__construct();
	}

	public static function process( $action, &$pass, &$data ) {
		$obj = new Discount();
		
		switch ( $action ) {
			// Discount Functions
			case 'init':   $data = $obj->init();   break;
			case 'rem':    $data = $obj->rem();    break;
			case 'set':    $data = $obj->set();    break;
			case 'active': $data = $obj->active(); break;

			default: $pass = false;
		}
	}

	// returns all discounts
	public function init() {
		$disSTH = $this->db->query("SELECT d.*, i.name AS itemName FROM discount d LEFT JOIN item i ON i.itemID = d.itemID;");
		$itemSTH = $this->db->query("SELECT itemID, parentID, name FROM item ORDER BY name;");
		return array(
			'discounts' => $disSTH->fetchAll( PDO::FETCH_ASSOC ),
			'items' => $itemSTH->fetchAll( PDO::FETCH_ASSOC )
		);
	}

	// assigns discont activness
	public function active() {
		$data = $this->getPostData();
		$STH = $this->db->prepare("UPDATE discount SET active=? WHERE discountID=?;");
		if (!$STH->execute($data->active, $data->discountID)) return $this->conflict();
		return $data;
	}

	// removes discount from db
	public function rem() {
		$data = $this->getPostData();
		$STH = $this->db->prepare("DELETE FROM discount WHERE discountID=?;");
		if (!$STH->execute($data->discountID)) return $this->conflict();
		return $data;
	}

	// stores discount changes
	public function set() {
		$d = $this->getPostData();
		if (isset($d->discountID)) {
			$STH = $this->db->prepare("UPDATE discount SET name=?,code=?,amount=?,itemID=?,compound=? WHERE discountID=?;");
			if (!$STH->execute($d->name, $d->code, $d->amount, $d->itemID, $d->compound, $d->discountID)) return $this->conflict();
		} else {
			$STH = $this->db->prepare("INSERT INTO `discount` (`itemID`,`name`,`code`,`amount`,`active`,`compound`) VALUES (?,?,?,?,'true',?);");
			if (!$STH->execute($d->itemID, $d->name, $d->code, $d->amount, $d->compound)) return $this->conflict();
			$d = (object) array_merge( (array)$d, array('discountID' => $this->db->lastInsertId()) );
		}
		return $d;
	}
}