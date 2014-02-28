<?php

set_time_limit ( 30 );
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('error_reporting', E_ALL ^ E_STRICT);

if ( file_exists( __DIR__ . '/config.php' ) ) {
	require_once( __DIR__ . '/config.php' );
} else {
	die( 'Please rename "config_blank.php" to "config.php" and configure the appropriate variables<br/>This would be a good place for an install script' );
}

// Required Includes
require_once( __DIR__ . '/db.php' );
require_once( __DIR__ . '/ng.php' );

// Included classes
require_once( __DIR__ . '/admin/index.php' );
require_once( __DIR__ . '/cart.php' );
require_once( __DIR__ . '/mail.php' );
require_once( __DIR__ . '/user.php' );
