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

		// Purchases
		$purchaseSTH = $this->db->prepare("UPDATE purchase SET firmID=? WHERE firmID=?;");
		if (!$purchaseSTH->execute($d->destID, $d->srcID)) return $this->conflict();

		// Contact
		$contactSTH = $this->db->prepare("UPDATE contact SET firmID=? WHERE firmID=?;");
		if (!$contactSTH->execute($d->destID, $d->srcID)) return $this->conflict();

		// Set Address
		$addressSTH = $this->db->prepare("INSERT INTO address (addrName,addr1,addr2,city,state,zip) VALUES (?,?,?,?,?,?);");
		if (!$addressSTH->execute(
			$d->merge->addrName, $d->merge->addr1, $d->merge->addr2, $d->merge->city, $d->merge->state, $d->merge->zip
		)) return $this->conflict();

		// Set Firm
		$firmSTH = $this->db->prepare("UPDATE firm SET addressID=?, name=?, website=? WHERE firmID=?;");
		if (!$firmSTH->execute( $this->db->lastInsertId(), $d->merge->name, $d->merge->website, $d->destID )) return $this->conflict();

		// Remove Firm
		$rmSTH = $this->db->prepare("DELETE FROM firm WHERE firmID=?;");
		if (!$rmSTH->execute( $d->srcID )) return $this->conflict();
		
		return $d->merge;
	}
}
