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

		// Add Custom Footer to messages
		$html .= "<p style='font-family:\"Palatino Linotype\",\"serif\";font-variant:small-caps;'>";
		$html .= "	<span style='color:black;letter-spacing:1.1pt'>";
		$html .= "		<b>Upstream Academy</b>";
		$html .= "	</span>";
		$html .= "	<br/>";
		$html .= "	<span style='font-size:10pt;color:gray;letter-spacing:.4pt'>";
		$html .= "		P. O. Box 1147&nbsp;&nbsp;828 Great Northern Blvd&nbsp;&nbsp;Helena, MT 59624-1147";
		$html .= "		<br/>";
		$html .= "		(P) 406-495-1850&nbsp;&nbsp;&nbsp;(F) 406-442-1100&nbsp;&nbsp;&nbsp;";
		$html .= "		<a href=\"mailto:info@upstreamacademy.com\" style='color:gray;'>info@upstreamacademy.com</a>";
		$html .= "	</span>";
		$html .= "	<br/>";
		$html .= "	<span style='font-size:10.0pt;color:navy;color:navy;letter-spacing:1.1pt;text-align:justify'>";
		$html .= "		Guiding accounting firms to high performance";
		$html .= "		&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;";
		$html .= "		<a href=\"http://www.upstreamacademy.com/\" style='color:#31849B;letter-spacing:1.0pt'>upstreamacademy.com</a>";
		$html .= "	</span>";
		$html .= "</p>";

		$this->addAddress($to, $name);
		$this->Subject = $subject;
		$this->Body    = $html;
		$this->AltBody = strip_tags($html);
		return $this->send();
	}
}