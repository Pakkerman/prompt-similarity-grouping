/bin/bash

file="$1"

exiftool -b -userComment "$file" | jq -r '.extraMetadata | fromjson | .prompt'

# parallel (doesn't seem to be faster)
# read -a files <<<"$1"
#
#
# parallel \
# 	--jobs 8 \
# 	--delay 0.1 \
# 	exiftool -b -userComment {} ::: \
# 	"${files[@]}" |
# 	jq -c '.extraMetadata | fromjson | .prompt'
