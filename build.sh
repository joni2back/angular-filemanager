#!/bin/bash

#download yui compressor here
#https://github.com/yui/yuicompressor/releases/download/v2.4.8/yuicompressor-2.4.8.jar

echo "Deprecated script, use: gulp build"

YUI_COMPRESSOR_JAR="/opt/yuicompressor-2.4.8.jar"
MINIFIED_FILE="angular-filemanager.min.js"
DIR_DIST="dist"
MINIFIED_PATH="$DIR_DIST/$MINIFIED_FILE"

find src/js ! -name "$MINIFIED_FILE" -name "*.js" \
    | sort \
    | xargs -I "{}" cat "{}"  > "$MINIFIED_PATH"

if $(echo "$@" | grep -qv 'prevent-minify') ; then
    if [ -f "$YUI_COMPRESSOR_JAR" ] && which java > /dev/null ; then
        java -jar "$YUI_COMPRESSOR_JAR" "$MINIFIED_PATH" -o "$MINIFIED_PATH"
    fi
fi

ES=$?;
echo "OUTFILE: $MINIFIED_PATH"
exit $ES
