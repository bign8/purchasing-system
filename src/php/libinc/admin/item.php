<?php

class Item extends NG {

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

	// returns all items
	public function init() {
		// Items (to convert)
		$itemSTH = $this->db->query("SELECT i.*, count(j.itemID)AS count FROM item i LEFT JOIN item j ON i.itemID=j.parentID GROUP BY i.itemID;");
		$items = $itemSTH->fetchAll();
		foreach ($items as &$value) $value['settings'] = json_decode($value['settings']);

		// Prices (to convert)
		$priceSTH = $this->db->query("SELECT * FROM price;");
		$prices = $itemSTH->fetchAll();
		foreach ($prices as &$value) $value['settings'] = json_decode($value['settings']);
		
		// Others
		$tplSTH   = $this->db->query("SELECT * FROM template;");
		$fieldSTH = $this->db->query("SELECT * FROM field;");
		$tieSTH   = $this->db->query("SELECT * FROM tie;");

		return array(
			'items'  => $items,
			'prices' => $prices,
			'tpls'   => $tplSTH->fetchAll(),
			'fields' => $fieldSTH->fetchAll(),
			'ties'   => $tieSTH->fetchAll(),
		);
	}

	// removes discount from db
	public function rem() {
		$data = $this->getPostData();
		$STH = $this->db->prepare("DELETE FROM item WHERE itemID=?;");
		if (!$STH->execute($data->itemID)) return $this->conflict();
		return $data;
	}

	// stores discount changes
	public function set() {
		$d = $this->getPostData();
		if (isset($d->itemID)) {
			$STH = $this->db->prepare("UPDATE item SET name=?,desc=? WHERE itemID=?;");
			if (!$STH->execute($d->name, $d->desc, $d->itemID)) return $this->conflict();
		} else {
			$STH = $this->db->prepare("INSERT INTO item (parentID, name, desc, settings) VALUES (?,?,?,?);");
			if (!$STH->execute($d->parentID, $d->name, $d->desc, json_encode($d->settings))) return $this->conflict();
			$d = (object) array_merge( (array)$d, array('itemID' => $this->db->lastInsertId()) );
		}
		return $d;
	}
}
