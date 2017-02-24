#!/bin/bash
cd upload
# cat $CONFIGFILE
cp $CONFIGFILE ./config.json
npm install
node index.js ./config.json $WORKSPACE $BUILD_NUMBER

