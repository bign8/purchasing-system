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
			case 'init': $data = $obj->init(); break;
			case 'set':  $data = $obj->set();  break;
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

	// stores discount changes
	public function set() {
		$d = $this->getPostData();
		if (isset($d->fieldID)) {
			$STH = $this->db->prepare("UPDATE field SET name=?,type=?,toStore=?,help=?,settings=? WHERE fieldID=?;");
			if (!$STH->execute($d->name, $d->type, $d->toStore, $d->help, json_encode($d->settings), $d->fieldID)) return $this->conflict();
		} else {
			$STH = $this->db->prepare("INSERT INTO `field` (`name`,`type`,`toStore`,`help`,`settings`) VALUES (?,?,?,?,?);");
			if (!$STH->execute($d->name, $d->type, $d->toStore, $d->help, json_encode($d->settings))) return $this->conflict();
			$d = (object) array_merge( (array)$d, array('firmID' => $this->db->lastInsertId()) );
		}
		return $d;
	}
}