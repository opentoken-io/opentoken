#!/usr/bin/env bash
#/ Make a signed request to an OpenToken API.  This is a proof of concept
#/ illustrating that signed requests can be made using only the Bash shell.
#/
#/ Requires the following environment variables:
#/
#/ * OPENTOKEN_API: URL typically used for self discovery.
#/   eg. http://api.example.com/
#/ * OPENTOKEN_CODE: The API code.
#/ * OPENTOKEN_SECRET: The API secret.
#/ * DEBUG: When set to a non-empty value, this turns on some debugging.
#/
#/ --help - Show this message.
#/ $1     - HTTP verb to use.
#/ $2     - Path you're accessing.
#/ $3     - Optional, the content-type for the data.
#/ stdin  - Data is passed in via stdin.
#/ stdout - Resulting response body is sent out this way.
#/ stderr - Headers and debug information.
#/
#/ Examples:
#/
#/     # Issue a GET on the self-discovery URL
#/     echo -n "" | ./signed-request.sh GET /
#/
#/     # Create a public token
#/     echo "data goes here to be tokenized" | \
#/     ./signed-request.sh POST "/account/$OPENTOKEN_ACCOUNT/token/?public=true"
#/
#/     # Retrieve a token
#/     echo -n "" | \
#/     ./signed-request.sh GET "/account/$OPENTOKEN_ACCOUNT/token/TOKEN_ID"

# Scan a list of values.  Returns true (0) if the value is in the array.
#
# $1    - Value to find.
# $2-$@ - Array of values to search.
#
# Examples
#
#   arr=(a b c d e)
#
#   if !arrayContainsValue x "${arr[@]}"; then
#       echo "x was not found within the array"
#   fi
#
# Returns 0 when the value is found, 1 otherwise.
arrayContainsValue() {
    local val

    val=$1
    shift

    while [[ $# -gt 0 ]]; do
        if [[ "$1" == "$val" ]]; then
            return 0
        fi

        shift
    done

    return 1
}

# Delete temp files that are used by this script.  Set the EXIT trap to
# call this function first, then define the temp variables by creating
# the temp files in a secure way.  Then just forget about it - this script
# will now clean up its own temp file.
#
# Example
#
#   trap deleteTempFile EXIT
#   tempFileBody=$(mktemp)
#   tempFileSignature=$(mktemp)
#
# Returns nothing.
deleteTempFile() {
    if [[ -n "$tempFileBody" ]]; then
        rm "$tempFileBody"
    fi

    if [[ -n "$tempFileSignature" ]]; then
        rm "$tempFileSignature"
    fi
}


# Enable strict error checking
set -eEuo pipefail

# Check for -h or --help
if arrayContainsValue --help "$@" || arrayContainsValue -h "$@"; then
    grep "^#/" "$0" | cut -b 4-

    exit 0
fi

if [[ -n "${DEBUG-}" ]]; then
    set -x
fi

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
    echo "Missing verb"
    errorExit=true
fi

if [[ -z "$2" ]]; then
    echo "Missing path/query string"
    errorExit=true
fi

if $errorExit; then
    echo "Use --help for usage instructions"
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

trap deleteTempFile EXIT
tempFileSignature=$(mktemp)
tempFileBody=$(mktemp)

# Capture stdin for the body of the request
cat > "$tempFileBody"

# Make the content we wish to sign
{
    echo "$verb"
    echo "$path"
    echo "$queryString"
    echo "host:$host"
    echo "content-type:$contentType"
    echo "x-opentoken-date:$dateStr"
    echo ""
    cat "$tempFileBody"
} >> "$tempFileSignature"

# Sign the content and ensure it is a lowercase hex string
signature=$(openssl dgst -sha256 -hmac "$OPENTOKEN_SECRET" < "$tempFileSignature" | cut -d " " -f 2 | tr "[:upper:]" "[:lower:]")

curlCmd=(curl -s)
curlCmd+=(--dump-header /dev/stderr)
curlCmd+=(-X "$verb")
curlCmd+=(-H "host: $host")
curlCmd+=(-H "x-opentoken-date: $dateStr")
curlCmd+=(-H "content-type: $contentType")
curlCmd+=(-H "Authorization: OT1-HMAC-SHA256-HEX; access-code=$OPENTOKEN_CODE; signed-headers=host content-type x-opentoken-date; signature=$signature")
curlCmd+=(--data-binary "@$tempFileBody")
curlCmd+=("$protocol//$host$path$querySep$queryString")

if [[ -n "${DEBUG-}" ]]; then
    echo "${curlCmd[@]}" > /dev/stderr
fi

"${curlCmd[@]}"
