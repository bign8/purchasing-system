#!/bin/sh
#
# clears db only sections of code
# Source: http://stackoverflow.com/a/5072660/3220865

BASEDIR=$(dirname $0)

function cleanFiles() {
	echo ${1/\.\/bak\/release\/\.\.\/\.\./}; # clean paths
	sed -i -n '/.*START DEV.*/{:a; N; /.*END DEV.*/!ba; s/.*\n//; d;}; p' "$1"; # clean files
}
export -f cleanFiles

printf "\nCleaning PHP\n";
find $BASEDIR/../../src/ -name '*.php' -exec bash -c 'cleanFiles "{}"' \;

printf "\nCleaning HTML\n";
find $BASEDIR/../../src/ -name '*.html' -exec bash -c 'cleanFiles "{}"' \;

printf "\nCleaning JS\n";
find $BASEDIR/../../src/ -name '*.js' -exec bash -c 'cleanFiles "{}"' \;

printf "\nCleaning CSS\n";
find $BASEDIR/../../src/ -name '*.css' -exec bash -c 'cleanFiles "{}"' \;