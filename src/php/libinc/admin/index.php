<?php

class Admin {
	public static function process( $action, &$pass, &$data ) {

		// Check authorization!
		$usr = new User();
		$usr->requiresAdmin();

		// Pre-processing
		list( $area, $action ) = explode( '-', $action );
		$area = strtolower( $area );
		$admins = array(
			'discount',
			'field',
			'file',
			'firm',
			'item',
			'merge',
			'purchase',
		);

		// Execute if acceptable area
		if (in_array($area, $admins)) {
			require_once( __DIR__ . '/' . $area . '.php');
			$area = ucfirst($area);
			$area::process( $action, $pass, $data );
		} else $pass = false;
	}
}