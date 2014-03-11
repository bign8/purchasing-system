<?php

class Admin {
	public static function process( $action, &$pass, &$data ) {
		list( $area, $action ) = explode( '-', $action );
		$area = strtolower( $area );

		$admins = array(
			'discount',
			'firm',
			'item',
			'purchase',
			'merge',
		);

		if (in_array($area, $admins)) {
			require_once( __DIR__ . '/' . $area . '.php');
			$area = ucfirst($area);
			$area::process( $action, $pass, $data );
		} else $pass = false;
	}
}