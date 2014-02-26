<?php

/**
* Class: myPDO
* Purpose: To simplify the PDO connection process and accuratly report database connection issues
* Notes:
*         1. Constructor takes a DbOptions class to accurately build a Database Source Name (DSN) and connect to a database
*        2. Sets the Statement_Class attribute to use our myPDOStatement rather than the built in PDOStatement
*        3. On error, a report is sent via dbError to the webadmin's email as defined in CoreClass.php (a redirect to /dbError.cc is also fired)
*/
class myPDO extends PDO
{
	public function __construct()
	{
		try {
			$dns = sprintf(config::db_dsn, config::db_host, config::db_name, config::db_user, config::db_pass);
			parent::__construct( $dns, config::db_user, config::db_pass, config::$db_op );
			$this->setAttribute( PDO::ATTR_STATEMENT_CLASS,  array('myPDOStatement') ); // Set Statement_Class
			// START DEV
			$this->exec( 'PRAGMA foreign_keys = ON;' ); // Nate-added!
			// END DEV
		} catch (PDOException $e) {
			if( $_SERVER['REQUEST_URI'] != '/db404' ) { // to be implemented
				die($e->getMessage());
				// This would be a good spot to dispatch a real error and redirect to /db404
			}
		}
	}
}

/**
* Class: myPDOStatement
* Purpose: To extend the features of the default PDOStatement class
* Notes:
*        1. execute now allows us to pass multiple parameters and it will automatically wrap them as an array.
*                a. any single variable that is not an array will be wrapped as an array
*                b. default functionality is acceptable as well
*                b. Usage: $STH->execute($single_param) OR $STH->execute($first, $second, ...) OR $STH->execute(array($first, $second, ...))
*/
class myPDOStatement extends PDOStatement
{
	protected function __construct()
	{
		$this->setFetchMode( PDO::FETCH_ASSOC );
	}

	public function execute ( $bound_input_params = NULL )
	{
		$arr = func_get_args();
		$input_parameters = is_array($arr[0]) ? $arr[0] : $arr ;
		return parent::execute($input_parameters);
	}
}