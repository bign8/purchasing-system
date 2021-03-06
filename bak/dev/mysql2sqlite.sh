#!/bin/sh

# Converts a mysqldump file into a Sqlite 3 compatible file. It also extracts the MySQL `KEY xxxxx` from the
# CREATE block and create them in separate commands _after_ all the INSERTs.

# Awk is chosen because it's fast and portable. You can use gawk, original awk or even the lightning fast mawk.
# The mysqldump file is traversed only once.

# Usage: $ ./mysql2sqlite mysqldump-opts db-name | sqlite3 database.sqlite
# Example: $ ./mysql2sqlite --no-data -u root -pMySecretPassWord myDbase | sqlite3 database.sqlite

# Thanks to and @artemyk and @gkuenning for their nice tweaks.

# mysqldump --skip-extended-insert --compact  "$@" | \
# cat "$@" | \

BASEDIR=$(dirname $0)

awk -f $BASEDIR/mysql2sqlite.awk "$@"

exit 0