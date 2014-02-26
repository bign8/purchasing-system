<?php

class Admin {
	public static function process( $action, &$pass, &$data ) {
		list( $area, $action ) = explode( '-', $action );

		switch ( $area ) {
			case 'discount': require_once( __DIR__ . '/discount.php' ); Discount::process( $action, $pass, $data ); break;

			default: $pass = false;
		}
	}
}