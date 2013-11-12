<?php

require_once('./libinc/main_include.php');

$db = new myPDO();
$STH = $db->query("SELECT * FROM item;");

while ($row = $STH->fetch( PDO::FETCH_ASSOC )) {
	print_r($row);
}