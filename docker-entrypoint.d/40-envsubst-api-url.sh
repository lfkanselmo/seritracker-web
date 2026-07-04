#!/bin/sh
set -e

: "${API_URL:?API_URL environment variable must be set}"

html_dir="/usr/share/nginx/html"
placeholder='${API_URL}'

for file in "$html_dir"/*.js; do
    [ -f "$file" ] || continue
    if grep -qF "$placeholder" "$file"; then
        sed -i "s|\${API_URL}|$API_URL|g" "$file"
    fi
done
