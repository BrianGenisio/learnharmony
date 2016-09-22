#!/bin/bash

rm -rf ./docs
npm run build
mv ./build ./docs
cp ./CNAME ./docs
git add -u ./docs
git commit -m "publish"
git push