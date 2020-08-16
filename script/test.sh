#!/usr/bin/env bash

set -e
shopt -s nullglob

which exiftool

test_jpg() {
	if [ $(exiftool $1 | grep -i gps | grep -c -i -v version) -eq 0 ]; then
		echo "no gps data in $1"
		return
	fi

	./cli.js $1 out.jpg

	if [ $(exiftool out.jpg | grep -i gps | grep -c -i -v version) -ne 0 ]; then
		echo "OH NO $1"
		exit 1
	fi

}

if [ ! -d exif-samples ]; then
	git clone git@github.com:ianare/exif-samples.git
fi

for f in $(find exif-samples -iname "*.jpg"); do
	echo $f
	test_jpg $f
done

for f in $(find exif-samples -iname "*.jpeg"); do
	echo $f
	test_jpg $f
done
