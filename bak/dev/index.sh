#!/bin/sh
#
# runs all release scripts

BASEDIR=$(dirname $0)

printf "\nConverting Database Snapshot\n";
$BASEDIR/mysql2sqlite.sh $BASEDIR/../db.sql > $BASEDIR/db.sqlite.sql
