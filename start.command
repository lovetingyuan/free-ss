#! /bin/bash

node -e "var cc=require('child_process').execSync('echo ${BASH_SOURCE[0]}');require(require('path').resolve(cc+'','../index.js'))"
