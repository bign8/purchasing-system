<?php

class Purchase extends NG {

	// Constructor: Initialize session and db connections
	function __construct() {
		parent::__construct();
	}

	public static function process( $action, &$pass, &$data ) {
		$obj = new self();
		switch ( $action ) {
			case 'add':  $data = $obj->add();  break;
			case 'init': $data = $obj->init(); break;
			case 'rem':  $data = $obj->rem();  break;
			default: $pass = false;
		}
	}

	// returns all purchases / contacts / firms / items
	public function init() {
		$itemSTH     = $this->db->query("SELECT * FROM item;");
		$purchaseSTH = $this->db->query("SELECT *, p.contactID FROM purchase p LEFT JOIN 'order' o ON o.orderID = p.orderID;");
		$contactSTH  = $this->db->query("SELECT contactID, legalName, preName, title, email, phone FROM contact;");
		$firmSTH     = $this->db->query("SELECT * FROM firm;");

		return array(
			'items'     => $itemSTH->fetchAll(),
			'purchases' => $purchaseSTH->fetchAll(),
			'contacts'  => $contactSTH->fetchAll(),
			'firms' => $firmSTH->fetchAll(),
		);
	}

	// removes purchase
	public function rem() {
		$data = $this->getPostData();
		$STH = $this->db->prepare("DELETE FROM purchase WHERE purchaseID=?;");
		if (!$STH->execute($data->purchaseID)) return $this->conflict();
		return $data;
	}

	// adds purchase
	public function add() {
		$d = $this->getPostData();
		$STH = $this->db->prepare("INSERT INTO purchase (contactID,firmID,itemID,orderID,isMember,data) VALUES (?,?,?,?,?,?);");
		if (!$STH->execute( $d->contactID, $d->firmID, $d->itemID, null, $d->isMember, 'manual' )) return $this->conflict();

		$STH2 = $this->db->prepare("SELECT *, p.contactID as contactID FROM purchase p LEFT JOIN 'order' o ON o.orderID = p.orderID WHERE p.purchaseID=?;");
		if (!$STH2->execute( $this->db->lastInsertId() )) return $this->conflict();

		return $STH2->fetch();
	}
}
