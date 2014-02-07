<?php

$fieldName = 'uploadedFile';

try {
    
    // Undefined | Multiple Files | $_FILES Corruption Attack, treat it invalid.
    if ( !isset($_FILES[ $fieldName ]['error']) || is_array($_FILES[ $fieldName ]['error']) ) throw new RuntimeException('Invalid parameters.');

    // Check $_FILES[ $fieldName ]['error'] value.
    switch ($_FILES[ $fieldName ]['error']) {
        case UPLOAD_ERR_OK:
            break;
        case UPLOAD_ERR_NO_FILE:
            throw new RuntimeException('No file sent.');
        case UPLOAD_ERR_INI_SIZE:
        case UPLOAD_ERR_FORM_SIZE:
            throw new RuntimeException('Exceeded filesize limit.');
        default:
            throw new RuntimeException('Unknown errors.');
    }

    // You should also check filesize here. 
    if ($_FILES[ $fieldName ]['size'] > 1000000) throw new RuntimeException('Exceeded filesize limit.');

    // Check MIME Type by yourself.
    $finfo = new finfo(FILEINFO_MIME_TYPE);
    $goodTypes = array('jpg' => 'image/jpeg', 'png' => 'image/png', 'gif' => 'image/gif');
    if (false === $ext = array_search( $finfo->file($_FILES[ $fieldName ]['tmp_name']), $goodTypes, true )) throw new RuntimeException('Invalid file format.');

    // You should name it uniquely, obtain safe unique name from its binary data.
    $fileName = sprintf('./uploads/%s.%s', sha1_file($_FILES[ $fieldName ]['tmp_name']), $ext );
    if (!move_uploaded_file( $_FILES[ $fieldName ]['tmp_name'], $fileName )) throw new RuntimeException('Failed to move uploaded file.');

    echo $fileName;

} catch (RuntimeException $e) {
    echo $e->getMessage();
}