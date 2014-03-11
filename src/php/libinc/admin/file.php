<?php

class File extends NG {

	// Constructor: Initialize session and db connections
	function __construct() {
		parent::__construct();
	}

	public static function process( $action, &$pass, &$data ) {
		$obj = new self();
		switch ( $action ) {
			case 'edit':    $data = $obj->edit();    break;
			case 'init':    $data = $obj->init();    break;
			case 'rem':     $data = $obj->rem();     break;
			case 'upload':  $data = $obj->upload();  break;
			default: $pass = false;
		}
	}

	// returns all files
	public function init() {
		function fillArrayWithFileNodes( DirectoryIterator $dir ) {
			$data = array();
			foreach ( $dir as $node ) {
				if ( $node->isDir() && !$node->isDot() ) {
					$data[] = array(
						'name' => $node->getFilename(),
						'children' => fillArrayWithFileNodes( new DirectoryIterator( $node->getPathname() ) ),
						'size' => false
					);
				} else if ( $node->isFile() ) {
					$data[] = array(
						'name' => $node->getFilename(),
						'children' => false,
						'size' => $node->getSize()
					);
				}
			}
			return $data;
		}
		$fileData = fillArrayWithFileNodes( new DirectoryIterator( $_SERVER['DOCUMENT_ROOT'] . '\\files' ) );
		return $fileData;
	}

	// deletes a file
	public function rem() {
		$d = $this->getPostData();
		$path = $_SERVER['DOCUMENT_ROOT'] . DIRECTORY_SEPARATOR . 'files' . DIRECTORY_SEPARATOR . $d->file;
		if (!@unlink( $path )) if (!@rmdir( $path )) return $this->conflict();
		return $d;
	}

	// changes the name of a file (can move files too...be carefull!)
	public function edit() {
		$d = $this->getPostData();
		$path = str_replace("/", DIRECTORY_SEPARATOR, $d->path);
		$newName = str_replace("/", DIRECTORY_SEPARATOR, $d->newName);
		$base = $_SERVER['DOCUMENT_ROOT'] . DIRECTORY_SEPARATOR . 'files' . DIRECTORY_SEPARATOR . $path;
		if (!@rename( $base . $d->file, $base . $newName )) return $this->conflict();
		return $d;
	}

	// stores discount changes
	public function upload() {
		print_r($_REQUEST);
		print_r($_FILES);
		
		// return $d;
	}
}
