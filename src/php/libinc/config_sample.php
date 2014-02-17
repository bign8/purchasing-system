<?php

class config {
	// For PHPMailer Class for sending email from forms and error reports
	const defaultEmail = '';
	const defaultFrom  = '';
	const notifyEmail  = '';
	const notifyName   = '';

	// For database connection scheme
	const db_dsn       = 'mysql:host=%s;dbname=%s'; // %s is replaced in following order (server, name, user, pass)
	const db_server    = '';
	const db_name      = '';
	const db_user      = ''; // also passed to new PDO(...) to allow mysql connections
	const db_pass      = ''; // also passed to new PDO(...) to allow mysql connections
	static $db_opt     = array(); // PDO connection options

	// Misc use
	const encryptSTR   = 'RandomSaltString'; // Try using random.org/strings
}