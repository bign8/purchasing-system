<?php

class Merge extends NG {

	// Constructor: Initialize session and db connections
	function __construct() {
		parent::__construct();
	}

	public static function process( $action, &$pass, &$data ) {
		$obj = new self();
		switch ( $action ) {
			case 'init': $data = $obj->init(); break;
			case 'set':  $data = $obj->set();  break;
			default: $pass = false;
		}
	}

	// returns all firms
	public function init() {
		$firmSTH = $this->db->query("SELECT * FROM firm f JOIN address a ON f.addressID = a.addressID;");
		return $firmSTH->fetchAll();
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
