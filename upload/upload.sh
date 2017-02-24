#!/bin/bash
cd upload
cat $CONFIGFILE
npm install
node index.js $CONFIGFILE $WORKSPACE $BUILD_NUMBER

