<?php

class Field extends NG {

	// Constructor: Initialize session and db connections
	function __construct() {
		parent::__construct();
	}

	public static function process( $action, &$pass, &$data ) {
		$obj = new self();
		
		switch ( $action ) {
			// Discount Functions
			case 'init':   $data = $obj->init();   break;
			// case 'rem':    $data = $obj->rem();    break;
			case 'set':    $data = $obj->set();    break;
			// case 'active': $data = $obj->active(); break;

			default: $pass = false;
		}
	}

	// returns all discounts
	public function init() {
		$fieldSTH = $this->db->query("SELECT * FROM field;");
		$fields = $fieldSTH->fetchAll( PDO::FETCH_ASSOC );
		foreach ($fields as &$field) $field['settings'] = json_decode( $field['settings'] );
		return $fields;
	}

	// // assigns discont activness
	// public function active() {
	// 	$data = $this->getPostData();
	// 	$STH = $this->db->prepare("UPDATE discount SET active=? WHERE discountID=?;");
	// 	if (!$STH->execute($data->active, $data->discountID)) return $this->conflict();
	// 	return $data;
	// }

	// // removes discount from db
	// public function rem() {
	// 	$data = $this->getPostData();
	// 	$STH = $this->db->prepare("DELETE FROM discount WHERE discountID=?;");
	// 	if (!$STH->execute($data->discountID)) return $this->conflict();
	// 	return $data;
	// }

	// stores discount changes
	public function set() {
		$d = $this->getPostData();
		if (isset($d->fieldID)) {
			$STH = $this->db->prepare("UPDATE field SET name=?,type=?,toStore=?,settings=? WHERE fieldID=?;");
			if (!$STH->execute($d->name, $d->type, $d->toStore, json_encode($d->settings), $d->fieldID)) return $this->conflict();
		} else {
			$STH = $this->db->prepare("INSERT INTO `field` (`fieldID`,`name`,`type`,`toStore`,`settings`) VALUES (?,?,?,?,?);");
			if (!$STH->execute($d->name, $d->type, $d->toStore, json_encode($d->settings))) return $this->conflict();
			$d = (object) array_merge( (array)$d, array('firmID' => $this->db->lastInsertId()) );
		}
		return $d;
	}
}