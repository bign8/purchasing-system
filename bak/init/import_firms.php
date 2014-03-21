<?php

$handle = fopen(__DIR__ . DIRECTORY_SEPARATOR . 'export_top_clients.csv', 'r');

// Show the particular fields
$fields = fgetcsv( $handle );
// print_r($fields);

// Array (
//     [0] => Membership
//     [1] => UAN
//     [2] => Firm
//     [3] => Website
//     [4] => Address 1
//     [5] => Address 2
//     [6] => City
//     [7] => State
//     [8] => Zip
// )

// Initialize and prepare db connections
$db = new PDO('sqlite:' . __DIR__ . '/../../build/libinc/ua-purchase.sqlite3');
$addrSTH = $db->prepare("INSERT INTO address (addrName, addr1, addr2, city, state, zip) VALUES ('Main Firm',?,?,?,?,?);");
$firmSTH = $db->prepare("INSERT INTO firm (addressID, name, website) VALUES (?,?,?);");
$membSTH = $db->prepare("INSERT INTO purchase (firmID, itemID, orderID, isMember, data) VALUES (?,?,NULL,'true','manual');");

// Loop through the records
$x = 1;
while ( ($data = fgetcsv($handle)) !== false ) {
	$str = sprintf('%3d', $x++);
	echo $str;

	if (strlen($data[2]) < 2) die('End?');

	if (count($data) != 9) die('Bad Col Count '.print_r($data, true));

	// Insert Addresses
	$addr = array_slice($data, 4);
	if (!$addrSTH->execute($addr)) die('Bad Address '.print_r($addr, true));
	$addrID = $db->lastInsertId();

	// Insert Firm
	$firm = array_slice($data, 2, 2);
	array_unshift($firm, $addrID);
	if (!$firmSTH->execute($firm)) die('Bad Firm '.print_r($firm, true));
	$firmID = $db->lastInsertId();

	// Assign membership
	switch ($data[0]) {
		case 'CPAm': $itemID = 166; break;
		case  'PKF': $itemID = 169; break;
		case  'AGN': $itemID = 165; break;
		case     '': $itemID =  -1; break;
		default: die('Unknown Membership ' . $data[0]);
	}
	if ($itemID > -1 && !$membSTH->execute( array($firmID, $itemID) )) die('Bad Member '.$itemID.' '.print_r($data, true));

	// Assign UAN
	if (strlen($data[1]) > 1 && !$membSTH->execute( array($firmID, '2') )) die('Bad UAN '.print_r($data, true));

	echo str_repeat( chr(8), strlen($str) );
}
