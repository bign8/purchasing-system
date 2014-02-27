<?php

class Firm extends NG {

	// Constructor: Initialize session and db connections
	function __construct() {
		parent::__construct();
	}

	public static function process( $action, &$pass, &$data ) {
		$obj = new self();
		switch ( $action ) {
			case 'init':   $data = $obj->init();   break;
			// case 'rem':    $data = $obj->rem();    break;
			// case 'set':    $data = $obj->set();    break;
			// case 'active': $data = $obj->active(); break;
			default: $pass = false;
		}
	}

	// returns all firms
	public function init() {
		$STH = $this->db->query("SELECT * FROM firm f JOIN address a ON f.addressID = a.addressID;");
		$ret = $STH->fetchAll();
		foreach ($ret as &$value) $this->cleanAddress( $value );
		return $ret;
	}
	private function cleanAddress( &$value ) { // Helper: formats address for app
		$value['addr'] = array(
			'addressID' => $value['addressID'],
			'addrName' => $value['addrName'],
			'addr1' => $value['addr1'],
			'addr2' => $value['addr2'],
			'city' => $value['city'],
			'state' => $value['state'],
			'zip' => $value['zip'],
		);
		unset($value['addressID'], $value['addrName'], $value['addr1'], $value['addr2'], $value['city'], $value['state'], $value['zip']);
		return $value;
	}

	// assigns discont activness
	// public function active() {
	// 	// $data = $this->getPostData();
	// 	// $STH = $this->db->prepare("UPDATE discount SET active=? WHERE discountID=?;");
	// 	// if (!$STH->execute($data->active, $data->discountID)) return $this->conflict();
	// 	// return $data;
	// }

	// removes discount from db
	// public function rem() {
	// 	// $data = $this->getPostData();
	// 	// $STH = $this->db->prepare("DELETE FROM discount WHERE discountID=? LIMIT 1;");
	// 	// if (!$STH->execute($data->discountID)) return $this->conflict();
	// 	// return $data;
	// }

	// stores discount changes
	// public function set() {
	// 	// $d = $this->getPostData();
	// 	// if (isset($d->discountID)) {
	// 	// 	$STH = $this->db->prepare("UPDATE discount SET name=?,code=?,amount=?,itemID=?,compound=? WHERE discountID=?;");
	// 	// 	if (!$STH->execute($d->name, $d->code, $d->amount, $d->itemID, $d->compound, $d->discountID)) return $this->conflict();
	// 	// } else {
	// 	// 	$STH = $this->db->prepare("INSERT INTO `discount` (`itemID`,`name`,`code`,`amount`,`active`,`compound`) VALUES (?,?,?,?,'yes',?);");
	// 	// 	if (!$STH->execute($d->itemID, $d->name, $d->code, $d->amount, $d->compound)) return $this->conflict();
	// 	// 	$d = (object) array_merge( (array)$d, array('discountID' => $this->db->lastInsertId()) );
	// 	// }
	// 	// return $d;
	// }
}
