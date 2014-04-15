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

	public static function process( $action, &$pass, &$data ) {
		$obj = new NG();
		switch ( $action ) {
			case 'prettyCrumb': $data = $obj->prettyCrumb(); break;
			default: $pass = false;
		}
	}

	// Helper(angular): angular data retriever / because angular is wierd
	protected function getPostData() {
		$data = isset($_REQUEST['input']) ? $_REQUEST['input'] : file_get_contents("php://input") ; // DEBUG
		return json_decode( $data );
	}

	// Helper(app): returns interpolated item (see: http://bit.ly/198oCOP)
	protected function interpolate( $message, array $context = array()) {
		$replace = array();
		foreach ($context as $key => $val) { // build a replacement array with braces around the context keys
			$replace['{' . $key . '}'] = $val;
		}
		return strtr($message, $replace); // interpolate replacement values into the message
	}

	// Helper(app): returns interpolated item (see: http://bit.ly/198oCOP)
	protected function interpolate2( $message, array $context = array()) {
		$callback = function ($matches) use ($context) { // function that formats data as specified
			$format = $matches[2] == '' ? '%s' : $matches[2] ; // default format
			return (isset($context[$matches[1]])) ? sprintf($format, $context[$matches[1]]) : $matches[0];
		};
		return preg_replace_callback( '/{([^\|}]+)\|?([^}]*)}/', $callback, $message ); // replacement query
	}

	// Helper(cart->setOptions): converts stdObjects to array (see: http://bit.ly/1eJETYC)
	protected function object_to_array($obj) {
		$arrObj = is_object($obj) ? get_object_vars($obj) : $obj;
		foreach ($arrObj as $key => $val) {
			$val = (is_array($val) || is_object($val)) ? $this->object_to_array($val) : $val;
			$arr[$key] = $val;
		}
		return $arr;
	}

	// Helper(php): sets header + returns error object (TODO: SEND ERROR LOG EMAIL)
	protected function conflict($data = null) {
		header('HTTP/ 409 Conflict');
		return is_null($data) ? $this->db->errorInfo() : $data;
	}

	// Worker(app/breadcrumb): return full name for breadcrumb
	public function prettyCrumb() {
		$data = $this->getPostData();
		$ret = ucfirst(@$data->name);

		if ( preg_match('/\/conference\/.*/', @$data->path) && @$data->index == 1 ) $q = "`name` FROM `item` WHERE `itemID`";
		if ( preg_match('/\/event\/.*/', @$data->path) && @$data->index == 1 ) $q = "`name` FROM `item` WHERE `itemID`";
		if ( preg_match('/\/admin\/discounts\/.*/', @$data->path) && @$data->index == 2 ) $q = "`name` FROM `discount` WHERE `discountID`";
		if ( preg_match('/\/admin\/items\/.*/', @$data->path) && @$data->index == 2 ) $q = "`name` FROM `item` WHERE `itemID`";

		if ( isset($q) ) {
			$STH = $this->db->prepare( "SELECT $q=? LIMIT 1;" );
			$test = $STH->execute( @$data->name );
			$value = $STH->fetchColumn();
			if ( $test && $value !== false ) $ret = $value;
		}
		return $ret;
	}
}
