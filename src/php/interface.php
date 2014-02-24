<?php

// Handle cross site
header('Access-Control-Allow-Origin: http://localhost:4001');
header('Access-Control-Allow-Credentials: true');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') exit(0);

require_once('./libinc/main_include.php');

/*
 *  Application Logic (fire methods depending on 'action')
 * ------------------------------------------------------- */

if (!isset($_REQUEST['a'])) $_REQUEST['a'] = 'nope'; // catch not assigned
if (!isset($_REQUEST['c'])) $_REQUEST['c'] = 'nope'; // catch not assigned

// START DEV
if ($_REQUEST['c'] != 'test' && $_REQUEST['a'] != 'getSession' && isset($_REQUEST['sessionID'])) {
	session_id($_REQUEST['sessionID']);
	session_start();
}
// END DEV

$pass = true; // determine response type
$data = array(); // return json data array

// Application logic, choose proper class and function
switch ($_REQUEST['c']) {
	case 'cart' :  Cart::process( $_REQUEST['a'], $pass, $data ); break;
	case 'user' :  User::process( $_REQUEST['a'], $pass, $data ); break;
	case 'app'  :    NG::process( $_REQUEST['a'], $pass, $data ); break;
	case 'admin': Admin::process( $_REQUEST['a'], $pass, $data ); break;
	// START DEV
	case 'test' :
		switch ($_REQUEST['a']) {
			case 'info': phpinfo(); break;
			case 'db':
				$cmd = sprintf(
					'mysqldump --host=%s -u %s -p%s %s -d --skip-opt',
					config::db_server,
					config::db_user,
					config::db_pass,
					config::db_name
				);
				die(system($cmd));
				break;
			case 'getSession':
				session_start();
				die(session_id());
				break;
			case 'sendCart':
				Cart::process( 'emailCart', $pass, $data );
				break;
			default: $pass = false;
		}
		break;
	// END DEV
	default: $pass = false; break;
}

// Determine proper return data
if ( $pass ) {
	if ( !is_bool($data) ) echo ")]}',\n";
	echo json_encode( $data );
} else {
	header( 'HTTP/ 405 Method Not Allowed' );
	echo 'Your Kung-Fu is not strong.';
}
