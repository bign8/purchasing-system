<?php

class NG {

	protected $db;

	/*
	 *   Angular App Helper functions
	 * ------------------------------------------------------------------------ */

	// Worker(constructor): initialized session and user object
	function __construct() {
		// if (session_status() == PHP_SESSION_NONE) session_start(); // start session if necessary (php >= 5.4.0)
		if (session_id() == '') session_start(); // start session if necessary (php < 5.4.0)

		$this->db = new myPDO();
	}

	// Helper(angular): angular data retriever / because angular is wierd
	protected function getPostData() {
		return json_decode(file_get_contents("php://input"));
	}

	// Helper(app): returns interpolated item (see: http://bit.ly/198oCOP)
	protected function interpolate( $message, array $context = array()) {
		$replace = array();
		foreach ($context as $key => $val) { // build a replacement array with braces around the context keys
			$replace['{' . $key . '}'] = $val;
		}
		return strtr($message, $replace); // interpolate replacement values into the message
	}

	// Worker(app/breadcrumb): return full name for breadcrumb
	public function prettyCrumb() {
		$data = $this->getPostData();

		$ret = ucfirst($data->name);

		// Pretty print product area
		if ( preg_match('/\/register\/.*/', $data->path) && $data->index == 1 ) {
			$STH = $this->db->prepare("SELECT `name` FROM `item` WHERE `itemID`=?;");
			$STH->execute( $data->name );
			$ret = $STH->fetchColumn();
		}

		return $ret;
	}
}
