<?php

require_once( __DIR__ . '/PHPMailer/PHPMailerAutoload.php' );

class UAMail extends PHPMailer {
	function __construct() {
		parent::__construct();

		$this->isSMTP();										// Set mailer to use SMTP
		$this->SMTPAuth 	= config::smtpAuth;					// Enable SMTP authentication
		$this->SMTPSecure 	= config::smtpSecure;				// Enable encryption, 'ssl' also accepted
		$this->Host 		= config::smtpServer;				// Specify main and backup server
		$this->Username 	= config::db_user;					// SMTP username
		$this->Password 	= config::db_pass;					// SMTP password

		$this->From 		= config::defaultEmail;
		$this->FromName 	= config::defaultFrom;

		$this->isHTML(true);									// Set email format to HTML
	}
}