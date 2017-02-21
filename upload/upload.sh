#!/bin/bash
ls
cd upload
echo $WORKSPACE
npm install
node index.js $WORKSPACE
