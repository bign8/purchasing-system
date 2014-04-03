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
		$fileData = fillArrayWithFileNodes( new DirectoryIterator( $_SERVER['DOCUMENT_ROOT'] . DIRECTORY_SEPARATOR . 'files' ) );
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
		if (!$this->makeDirectory( $base . $newName )) return $this->conflict('no-dir');
		if (!@rename( $base . $d->file, $base . $newName )) return $this->conflict();
		return $d;
	}

	// stores discount changes
	public function upload() {
		try {
			$fieldName = 'file';
			
			ini_set('upload_max_filesize', '100M');
			ini_set('post_max_size', '100M');
			ini_set('max_execution_time', 300);

			// Undefined | Multiple Files | $_FILES Corruption Attack, treat it invalid.
			if ( !isset($_FILES[ $fieldName ]['error']) || is_array($_FILES[ $fieldName ]['error']) )
				throw new RuntimeException('Invalid parameters. ' . print_r($_FILES, true));

			// Check $_FILES[ $fieldName ]['error'] value.
			switch ($_FILES[ $fieldName ]['error']) {
				case UPLOAD_ERR_OK: break;
				case UPLOAD_ERR_NO_FILE: throw new RuntimeException('No file sent.');
				case UPLOAD_ERR_INI_SIZE:
				case UPLOAD_ERR_FORM_SIZE: throw new RuntimeException('Exceeded filesize limit.');
				default: throw new RuntimeException('Unknown errors.');
			}

			// You should also check filesize here. 
			if ($_FILES[ $fieldName ]['size'] > 1000000) throw new RuntimeException('Exceeded filesize limit.');

			// Naming file as desired
			$fileName = $_SERVER['DOCUMENT_ROOT'] . DIRECTORY_SEPARATOR . 'files' . DIRECTORY_SEPARATOR . $_REQUEST['path'] . $_REQUEST['name'];
			$fileName = str_replace("/", DIRECTORY_SEPARATOR, $fileName);
			if (!$this->makeDirectory( $fileName )) return $this->conflict('no-dir');
			if (!move_uploaded_file( $_FILES[ $fieldName ]['tmp_name'], $fileName )) throw new RuntimeException('Failed to move uploaded file.');

			return $_FILES[ $fieldName ]['size'];

		} catch (RuntimeException $e) {
			return $this->conflict( $e->getMessage() );
		}
	}

	// make a directory according to where a file is being moved
	private function makeDirectory($filePath) {
		$filePath = substr($filePath, 0, strrpos($filePath, DIRECTORY_SEPARATOR) );
		if (!file_exists($filePath)) return mkdir($filePath, 0777, true);
		return true;
	}
}
