#!/bin/sh
#
# bumps version

BASEDIR=$(dirname $0)

sed -i "s/.*\"version\".*/  \"version\": \"$1\",/" $BASEDIR/../../package.json