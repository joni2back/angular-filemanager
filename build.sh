#!/bin/bash

#download yui compressor here
#https://github.com/yui/yuicompressor/releases/download/v2.4.8/yuicompressor-2.4.8.jar

YUI_COMPRESSOR_JAR="/opt/yuicompressor-2.4.8.jar"
MINIFIED_FILE="angular-filemanager.min.js"
DIR_DIST="assets/js"
MINIFIED_PATH="$DIR_DIST/$MINIFIED_FILE"

find assets/js ! -name "$MINIFIED_FILE" -name "*.js" \
    | sort \
    | xargs -I "{}" cat "{}" \
    | sed '{:q;N;s/\n/ /g;t q}' > "$MINIFIED_PATH"


if [ -f "$YUI_COMPRESSOR_JAR" ] && which java > /dev/null ; then
    java -jar "$YUI_COMPRESSOR_JAR" "$MINIFIED_PATH" -o "$MINIFIED_PATH"
fi

ES=$?;
echo "MINIFIED: $MINIFIED_PATH"
exit $ES
