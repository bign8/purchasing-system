<?php

require_once( __DIR__ . '/PHPMailer/PHPMailerAutoload.php' );

class UAMail extends PHPMailer {
	function __construct() {
		parent::__construct();
		$this->setFrom(config::defaultEmail, config::defaultFrom);
		$this->isHTML(true);
	}

	public function notify($subject, $html) {
		$this->addAddress(config::notifyEmail, config::notifyName);
		$this->Subject = $subject;
		$this->Body    = $html;
		$this->AltBody = strip_tags($html);
		return $this->send();
	}

	public function sendMsg($subject, $html, $to, $name = '') {
		$this->addAddress($to, $name);
		$this->Subject = $subject;
		$this->Body    = $html;
		$this->AltBody = strip_tags($html);
		return $this->send();
	}
}