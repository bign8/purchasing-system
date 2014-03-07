<?php

require_once( __DIR__ . '/PHPMailer/PHPMailerAutoload.php' );

class UAMail extends PHPMailer {
	function __construct() {
		parent::__construct();
		$this->setFrom(config::defaultEmail, config::defaultFrom);
		$this->isHTML(true);
	}

	public function notify($subject, $html) {

		// Add Custom Footer to messages
		$html .= file_get_contents(__DIR__ . '/foot.html');

		$this->addAddress(config::notifyEmail, config::notifyName);
		$this->Subject = $subject;
		$this->Body    = $html;
		$this->AltBody = strip_tags($html);
		return $this->send();
	}

	public function sendMsg($subject, $html, $to, $name = '', $hasFoot = true) {

		// Add Custom Footer to messages
		if ($hasFoot) $html .= file_get_contents(__DIR__ . '/foot.html');

		$this->addAddress($to, $name);
		$this->Subject = $subject;
		$this->Body    = $html;
		$this->AltBody = strip_tags($html);
		return $this->send();
	}
}