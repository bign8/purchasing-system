<?php

class config {
	// For PHPMailer Class for sending email from forms and error reports
	const defaultEmail = '';
	const defaultFrom  = '';
	const notifyEmail  = '';
	const notifyName   = '';

	// For database connection scheme
	const db_dsn  = 'sqlite:%s/%s'; // mysql: 'mysql:host=%s;dbname=%s'
	const db_host = __DIR__ ;
	const db_name = 'file.db';
	const db_user = '';
	const db_pass = '';
	static $db_op = array(); // PDO connection options
	// START DEV
	/*/
	const db_dsn    = 'mysql:host=%s;dbname=%s'; // passed in following order
	const db_server = 'server';
	const db_name   = 'dbname';
	const db_user   = 'user';
	const db_pass   = 'pass';
	static $db_opt  = array(); // PDO connection options
	//*/
	// END DEV
	
	// Misc use
	const encryptSTR   = '***randomString***'; // try: random.org/strings
}