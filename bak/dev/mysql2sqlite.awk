BEGIN {
	FS=",$"
	print "PRAGMA synchronous = OFF;"
	print "PRAGMA journal_mode = MEMORY;"
	print "BEGIN TRANSACTION;"
}

# CREATE TRIGGER statements have funny commenting.  Remember we are in trigger.
/^\/\*.*CREATE.*TRIGGER/ {
	gsub( /^.*TRIGGER/, "CREATE TRIGGER" )
	print
	inTrigger = 1
	next
}
# The end of CREATE TRIGGER has a stray comment terminator
/END \*\/;;/ { gsub( /\*\//, "" ); print; inTrigger = 0; next }
# The rest of triggers just get passed through
inTrigger != 0 { print; next }

# CREATE VIEW looks like a TABLE in comments
/^\/\*.*CREATE.*TABLE/ {
	inView = 1
	next
}
# The end of CREATE VIEW
/^(\).*ENGINE.*\*\/;)/ {
	inView = 0;
	next
}
# The rest of view just get passed through
inView != 0 { next }

# Skip other comments
/^\/\*/ { next }

# Print all `INSERT` lines. The single quotes are protected by another single quote.
/^INSERT/ {
	prev = "";
	gsub( /\\\047/, "\047\047" )
	gsub( /\\\047\047,/, "\\\047," )
	gsub(/\\n/, "\n")
	gsub(/\\r/, "\r")
	gsub(/\\"/, "\"")
	gsub(/\\\\/, "\\")
	gsub(/\\\032/, "\032")
	print
	next
}

# Print the `CREATE` line as is and capture the table name.
/^CREATE/ {
	print ""
	print
	aInc = 0;
	if ( match( $0, /`[^`]+/ ) ) {
		tableName = substr( $0, RSTART+1, RLENGTH-1 )
	}
	prev = "";
	firstInTable = 1;
	next
}

# Replace `FULLTEXT KEY` (probably other `XXXXX KEY`)
/^  FULLTEXT KEY/ { gsub( /.+KEY/, "  KEY" ) }

# Get rid of field lengths in KEY lines
/ (PRIMARY )?KEY/ { gsub(/\([0-9]+\)/, "") }

aInc == 1 && /PRIMARY KEY/ { next }

# Print all fields definition lines except the `KEY` lines.
/^  / && !/^(  KEY|\);)/ {
	if ( match( $0, /AUTO_INCREMENT|auto_increment/)) {
		aInc = 1;
		gsub( /AUTO_INCREMENT|auto_increment/, "PRIMARY KEY AUTOINCREMENT" )
	}
	gsub( /(UNIQUE KEY|unique key) `.*` /, "UNIQUE " )
	gsub( /(CHARACTER SET|character set) [^ ]+ /, "" )
	gsub( /DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP|default current_timestamp on update current_timestamp/, "" )
	gsub( /(COLLATE|collate) [^ ]+ /, "" )
	gsub(/(ENUM|enum)[^)]+\)/, "text ")
	gsub(/(SET|set)\([^)]+\)/, "text ")
	gsub(/UNSIGNED|unsigned/, "")
	gsub(/` [^ ]*(INT|int)[^ ]*/, "` integer")
	# field comments are not supported
	gsub(/COMMENT.+$/, "")
	# Get commas off end of line
	gsub(/,.?$/, "")
	if (prev) {
		if (firstInTable) {
			print prev
			firstInTable = 0
		} else print "," prev
	}
	prev = $1
}

/ ENGINE/ {
	if (prev) {
		if (firstInTable) {
			print prev
			firstInTable = 0
		} else print "," prev
	}
	prev=""
	print ");"
	# Print all `KEY` creation lines.
	for (table in key) {
		printf key[table]
		delete key[table]
	}
	print ""
	next
}
# `KEY` lines are extracted from the `CREATE` block and stored in array for later print 
# in a separate `CREATE KEY` command. The index name is prefixed by the table name to 
# avoid a sqlite error for duplicate index name.
/^(  KEY|\);)/ {
	if (prev) {
		if (firstInTable) {
			print prev
			firstInTable = 0
		} else print "," prev
	}
	prev = ""
	if ($0 == ");"){
		print
	} else {
		if (  match( $0, /`[^`]+/ ) ) {
			indexName = substr( $0, RSTART+1, RLENGTH-1 ) 
		}
		if ( match( $0, /\([^()]+/ ) ) {
			indexKey = substr( $0, RSTART+1, RLENGTH-1 ) 
		}
		key[tableName]=key[tableName] "CREATE INDEX \"idx_" tableName "_" indexName "\" ON \"" tableName "\" (" indexKey ");\n"
	}
}

END {
	print "END TRANSACTION;"
}