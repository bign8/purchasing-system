#!/bin/sh
#
# runs all release scripts

BASEDIR=$(dirname $0)

printf "\nBumping Version\n";
$BASEDIR/ver.sh $1

printf "\nCleaning Code\n";
$BASEDIR/code.sh