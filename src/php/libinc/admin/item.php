<?php

class Item extends NG {

	// Constructor: Initialize session and db connections
	function __construct() {
		parent::__construct();
	}

	public static function process( $action, &$pass, &$data ) {
		$obj = new self();
		switch ( $action ) {
			case 'addTie': $data = $obj->addTie(); break;
			case 'chgTie': $data = $obj->chgTie(); break;
			case 'init':   $data = $obj->init();   break;
			case 'mvTie':  $data = $obj->mvTie();  break;
			case 'rem':    $data = $obj->rem();    break;
			case 'rmPri':  $data = $obj->rmPri();  break;
			case 'rmTie':  $data = $obj->rmTie();  break;
			case 'set':    $data = $obj->set();    break;
			case 'setPri': $data = $obj->setPri(); break;
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
		$prices = $priceSTH->fetchAll();
		foreach ($prices as &$value) $value['settings'] = json_decode($value['settings']);
		
		// Others
		$tplSTH   = $this->db->query("SELECT templateID, name, costReq, itemReq FROM template;");
		$fieldSTH = $this->db->query("SELECT fieldID, name, type FROM field;");
		$tieSTH   = $this->db->query("SELECT * FROM tie;");

		return array(
			'items'  => $items,
			'prices' => $prices,
			'tpls'   => $tplSTH->fetchAll(),
			'fields' => $fieldSTH->fetchAll(),
			'ties'   => $tieSTH->fetchAll(),
		);
	}

	// removes item from db
	public function rem() {
		$data = $this->getPostData();
		$STH = $this->db->prepare("DELETE FROM item WHERE itemID=?;");
		if (!$STH->execute($data->itemID)) return $this->conflict();
		return $data;
	}

	// stores item changes
	public function set() {
		$d = $this->getPostData();
		if (isset($d->itemID)) {
			$STH = $this->db->prepare("UPDATE item SET name=?,parentID=?,desc=?,templateID=?,code=?,image=?,onFirm=?,settings=? WHERE itemID=?;");
			if (!$STH->execute(
				$d->name, $d->parentID, $d->desc, $d->templateID, $d->code, $d->image, $d->onFirm, json_encode($d->settings), $d->itemID
			)) return $this->conflict();
		} else {
			$STH = $this->db->prepare("INSERT INTO item (parentID,name,desc,settings,templateID,code,image,onFirm) VALUES (?,?,?,?,?,?,?,?);");
			if (!$STH->execute(
				$d->parentID, $d->name, $d->desc, json_encode($d->settings), $d->templateID, $d->code, $d->image, $d->onFirm
			)) return $this->conflict();
			$d = (object) array_merge( (array)$d, array('itemID' => $this->db->lastInsertId()) );
		}
		return $d;
	}

	// removes field, item tie
	public function rmTie() {
		$data = $this->getPostData();
		$STH = $this->db->prepare("DELETE FROM tie WHERE tieID=?;");
		if (!$STH->execute($data->tieID)) return $this->conflict();
		return $data;
	}

	// adds tie between field and item
	public function addTie() {
		$d = $this->getPostData();
		$maxSTH = $this->db->prepare("SELECT IFNULL(MAX(\"order\")+1,1) as \"order\" FROM tie WHERE itemID=?;");
		if (!$maxSTH->execute( $d->item->itemID )) return $this->conflict();
		$order = $maxSTH->fetchColumn();

		$STH = $this->db->prepare("INSERT INTO tie(fieldID,itemID,\"order\",required) VALUES (?,?,?,?);");
		if (!$STH->execute( $d->field->fieldID, $d->item->itemID, $order, 'false' )) return $this->conflict();
		return array(
			'tieID' => $this->db->lastInsertId(),
			'order' => $order
		);
	}

	// swaps tie order
	public function mvTie() {
		$d = $this->getPostData();
		$getSTH = $this->db->prepare("SELECT \"order\" FROM tie WHERE tieID=?;");
		$setSTH = $this->db->prepare("UPDATE tie SET \"order\"=? WHERE tieID=?;");
		$test = $getSTH->execute( $d->src );
		if ($test) {
			$src = $getSTH->fetchColumn();
			$test = $getSTH->execute( $d->dest );
		}
		if ($test) {
			$dest = $getSTH->fetchColumn();
			$test = $setSTH->execute( $src, $d->dest );
		}
		if ($test) $test = $setSTH->execute( $dest, $d->src );
		if (!$test) $this->conflict();
		return $test;
	}

	// Change if field is required (by tie)
	public function chgTie() {
		$data = $this->getPostData();
		$STH = $this->db->prepare("UPDATE tie SET required=?, onUser=? WHERE tieID=?;");
		if (!$STH->execute( $data->required, $data->onUser, $data->tieID )) $this->conflict();
		return $data;
	}

	// set price
	public function setPri() {
		$d = $this->getPostData();
		if (isset($d->priceID)) {
			$STH = $this->db->prepare("UPDATE price SET reasonID=?,inCart=?,templateID=?,settings=? WHERE priceID=?;");
			if (!$STH->execute(
				$d->reasonID, $d->inCart, $d->templateID, json_encode($d->settings), $d->priceID
			)) return $this->conflict();
		} else {
			$STH = $this->db->prepare("INSERT INTO price (itemID,reasonID,inCart,templateID,settings) VALUES (?,?,?,?,?);");
			if (!$STH->execute(
				$d->itemID, $d->reasonID, $d->inCart, $d->templateID, json_encode($d->settings)
			)) return $this->conflict();
			$d = (object) array_merge( (array)$d, array('priceID' => $this->db->lastInsertId()) );
		}
		return $d;
	}

	// remove price
	public function rmPri() {
		$data = $this->getPostData();
		$STH = $this->db->prepare("DELETE FROM price WHERE priceID=?;");
		if (!$STH->execute($data->priceID)) return $this->conflict();
		return $data;
	}
}
