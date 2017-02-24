#!/bin/bash
cd upload
echo $CONFIGFILE
npm install
node index.js $CONFIGFILE $WORKSPACE $BUILD_NUMBER
