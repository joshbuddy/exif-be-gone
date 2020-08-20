#!/usr/bin/env bash

set -e
set -o pipefail

which exiftool

test_file() {
	echo "Considering file ${f}"
	set +e
	pre_exif_out=$(exiftool "${f}")
	if [ $? -ne 0 ]; then
		echo "Skipping $1, exiftool couldn't read it"
		return
	fi
	set -e

	./cli.js "$1" out.jpg
	post_exif_out=$(exiftool out.jpg) 

	# ./metadata-extractor-images/jpg/Nikon E995 (iptc).jpg has '(GPS)' in it
	if [ $(echo $post_exif_out | grep -i gps | grep -i -v version | grep -c -i -v '(gps)') -ne 0 ]; then
		echo "After scrubbing $1, still found 'gps' present\n\nexiftool output was\n\n$exif_out"
		exit 1
	fi

	if [ $(echo $post_exif_out | grep -c -i coordinates) -ne 0 ]; then
		echo "After scrubbing $1, still found 'coordinates' present\n\nexiftool output was\n\n$exif_out"
		exit 1
	fi

	if [ $(echo $pre_exif_out | grep -c -E 'image/jpeg|image/tiff') -eq 1 ]; then
		if [ $(echo $post_exif_out | grep -c -E 'image/jpeg|image/tiff') -eq 0 ]; then
			echo "After scrubbing $1, couldn't find mimetype\n\npre exiftool output was\n\n$pre_exif_out\n\npost exiftool output was\n\n$post_exif_out"
			exit 1
		fi
	fi
}

if [ ! -d exif-samples ]; then
	git clone git@github.com:ianare/exif-samples.git
else
	echo "Updating exif-samples"
	cd exif-samples; git pull; cd ..
fi

if [ ! -d metadata-extractor-images ]; then
	git clone git@github.com:drewnoakes/metadata-extractor-images.git
else
	echo "Updating metadata-extractor-images"
	cd metadata-extractor-images; git pull; cd ..
fi


find exif-samples metadata-extractor-images \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.tiff" \) | while read f
do
	test_file "$f"
done
