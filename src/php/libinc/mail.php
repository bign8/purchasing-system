<?php

require_once( __DIR__ . '/PHPMailer/PHPMailerAutoload.php' );

class UAMail extends PHPMailer {
	function __construct() {
		parent::__construct();

		$this->isSMTP();										// Set mailer to use SMTP
		$this->CharSet="UTF-8";
		$this->SMTPDebug = 1;
		$this->SMTPAuth = true;									// Enable SMTP authentication
		$this->SMTPSecure = 'tsl';								// Enable encryption, 'ssl' also accepted
		$this->Host = 'mail.modwest.com';						// Specify main and backup server
		$this->Username = 'upstreamacademy';					// SMTP username
		$this->Password = '5xPChnPt';							// SMTP password

		$this->isHTML(true);									// Set email format to HTML
		$this->From = 'georgiac@upstreamacademy.com';
		$this->FromName = 'Georgia Cummings';
	}
}