#!/bin/sh
#
# runs all release scripts

BASEDIR=$(dirname $0)

printf "\nCleaning Code\n";
$BASEDIR/code.sh

printf "\nBumping Version\n";
$BASEDIR/ver.sh $1