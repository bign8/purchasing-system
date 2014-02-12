#!/bin/sh
#
# runs all release scripts

BASEDIR=$(dirname $0)

$BASEDIR/code.sh
$BASEDIR/ver.sh $1