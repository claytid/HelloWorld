#!/bin/bash
ls
cd upload
echo $APIKEYFILE
cat $APIKEYFILE
npm install
node index.js $WORKSPACE
