#!/usr/bin/env bash
# Make a signed request to an OpenToken API.  This is a proof of concept
# illustrating that signed requests can be made using only the Bash shell.
#
# Requires the following environment variables:
#
# * OPENTOKEN_API: URL typically used for self discovery.
#   eg. http://api.example.com/
# * OPENTOKEN_CODE: The API code.
# * OPENTOKEN_SECRET: The API secret.
#
# The first parameter is the HTTP verb to use.
# The second is the path you're accessing.
# The optional third parameter is the content-type for the data.
# Data should be passed in via stdin.
#
# Examples:
#
#     # Issue a GET on the self-discovery URL
#     echo "" | ./signed-request.sh GET /
#
#     # Create a public token
#     echo "data goes here to be tokenized" | \
#         ./signed-request.sh POST '/account/YOUR_ACCOUNT_ID/token/?public=true'
#
#     # Retrieve a token
#     echo "" | ./signed-request.sh GET /account/YOUR_ACCOUNT_ID/token/TOKEN_ID

errorExit=false

if [[ -z "$OPENTOKEN_API" ]]; then
    echo "Missing environment variable: OPENTOKEN_API"
    errorExit=true
fi

if [[ -z "$OPENTOKEN_CODE" ]]; then
    echo "Missing environment variable: OPENTOKEN_CODE"
    errorExit=true
fi

if [[ -z "$OPENTOKEN_SECRET" ]]; then
    echo "Missing environment variable: OPENTOKEN_SECRET"
    errorExit=true
fi

if [[ -z "$1" ]]; then
    echo "Missing path/query string"
    errorExit=true
fi

if $errorExit; then
    exit 1
fi

dateStr=$(date --iso-8601=seconds)
verb=$1
path=$2
contentType=${3:-application/octet-stream}

# Determine the protocol and host
protocol=${OPENTOKEN_API%//*}
host=${OPENTOKEN_API#*\/\/}
host=${host%/*}

# Split path into query string and path
queryString=${path#*\?}
querySep="?"

if [[ "$queryString" == "$path" ]]; then
    queryString=""
    querySep=""
fi

# clean up the verb
verb=$(echo "$verb" | tr "[:lower:]" "[:upper:]")

path=${path:0:${#path}-(${#queryString}+${#querySep})}

# Capture stdin
tempFile=$(mktemp)
cat > "$tempFile"

signature=$(echo "$verb
$path
$queryString
host:$host
content-type:$contentType
x-opentoken-date:$dateStr

$(cat "$tempFile")" | openssl dgst -sha256 -hmac "$OPENTOKEN_SECRET" | cut -d " " -f 2 | tr "[:upper:]" "[:lower:]")

curl -X "$verb" -H "host: $host" -H "content-type: $contentType" -H "x-opentoken-date: $dateStr" -H "Authorization: OT1-HMAC-SHA256-HEX; access-code=$OPENTOKEN_CODE; signed-headers=host content-type x-opentoken-date; signature=$signature" --data-binary "@$tempFile" "$protocol//$host$path$querySep$queryString"
