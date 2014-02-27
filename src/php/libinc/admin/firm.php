<?php

class Firm extends NG {

	// Constructor: Initialize session and db connections
	function __construct() {
		parent::__construct();
	}

	public static function process( $action, &$pass, &$data ) {
		$obj = new self();
		switch ( $action ) {
			case 'init': $data = $obj->init(); break;
			case 'rem':  $data = $obj->rem();  break;
			case 'set':  $data = $obj->set();  break;
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

	// removes discount from db
	public function rem() {
		$data = $this->getPostData();
		$STH = $this->db->prepare("DELETE FROM firm WHERE firmID=?;");
		if (!$STH->execute($data->firmID)) return $this->conflict();
		return $data;
	}

	// stores discount changes
	public function set() {
		$d = $this->getPostData();
		if (isset($d->firmID)) {
			$STH = $this->db->prepare("UPDATE firm SET name=?,website=? WHERE firmID=?;");
			if (!$STH->execute($d->name, $d->website, $d->firmID)) return $this->conflict();
		} else {
			$STH = $this->db->prepare("INSERT INTO firm (name, website, addressID) VALUES (?,?,?);");
			if (!$STH->execute($d->name, $d->website, $d->addr->addressID)) return $this->conflict();
			$d = (object) array_merge( (array)$d, array('firmID' => $this->db->lastInsertId()) );
		}
		return $d;
	}
}
