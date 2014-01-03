<?php

class NG {

	protected $db;

	/*
	 *   Angular App Helper functions
	 * ------------------------------------------------------------------------ */

	// Worker(constructor): initialized session and user object
	function __construct() {
		// if (session_status() == PHP_SESSION_NONE) session_start(); // start session if necessary
		if (session_id() == '') session_start(); // start session if necessary

		$this->db = new myPDO();
	}

	// Helper(angular): angular data retriever / because angular is wierd
	protected function getPostData() {
		return json_decode(file_get_contents("php://input"));
	}

	// Helper(app): returns interpolated item (see: https://github.com/php-fig/fig-standards/blob/master/accepted/PSR-3-logger-interface.md)
	private function interpolate( $message, array $context = array()) {
		// build a replacement array with braces around the context keys
		$replace = array();
		foreach ($context as $key => $val) {
			$replace['{' . $key . '}'] = $val;
		}

		// interpolate replacement values into the message and return
		return strtr($message, $replace);
	}

	// // Worker(app/breadcrumb): return full name for breadcrumb
	// public function prettyCrumb() {
	// 	$data = $this->getPostData();

	// 	$ret = ucfirst($data->name);

	// 	// Pretty print product area
	// 	if ( preg_match('/#\/products\/.*/', $data->path) && $data->index > 0 && $data->index < 3 ) {
	// 		if ( $data->index == 1 ) {
	// 			$STH = $this->db->prepare("SELECT `name` FROM `product` WHERE `productID`=?;");
	// 		} else { // has to be 2
	// 			$STH = $this->db->prepare("SELECT `name` FROM `item` WHERE `itemID`=?;");
	// 		}
	// 		$STH->execute( $data->name );
	// 		$ret = $STH->fetchColumn();
	// 	}

	// 	return $ret;
	// }
}