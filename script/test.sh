#!/usr/bin/env bash

set -e

which exiftool

test_jpg() {
	./cli.js "$1" out.jpg

	# ./metadata-extractor-images/jpg/Nikon E995 (iptc).jpg has '(GPS)' in it
	if [ $(exiftool out.jpg | grep -i gps | grep -i -v version | grep -c -i -v '(gps)') -ne 0 ]; then
		echo "OH NO $1"
		exit 1
	fi

	if [ $(exiftool out.jpg | grep -c -i coordinates) -ne 0 ]; then
		echo "OH NO $1"
		exit 1
	fi
}

if [ ! -d exif-samples ]; then
	git clone git@github.com:ianare/exif-samples.git
fi

if [ ! -d metadata-extractor-images ]; then
	git clone git@github.com:drewnoakes/metadata-extractor-images.git
fi

find . -iname "*.jpg" | while read f
do
	echo "considering file ${f}"
	test_jpg "$f"
done

find . -iname "*.jpeg" | while read f
do
	echo $f
	test_jpg "$f"
done
