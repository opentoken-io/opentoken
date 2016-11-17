Getting Started
===============

To use the API you must first sign up for it.  There are scripts in the [`../example/`](../example/) folder that will help you out.

This is not documenting the API.  There's [way better documentation](api/self-discovery.md) available for that.  This only runs through the example commands.


Creating an Account
-------------------

This process is the most labor-intensive, but you can do this in under a minute.

    cd example
    unset HISTFILE  # Turn off shell history so your password isn't stored
    ./create-account.js --email=your_email@example.com \
        --password=REALLY_GOOD_PASSWORD

This initiates the account setup.  You will get the MFA seed and you will need that seed in the future.  From here you will need to check your email for a link to validate your account.

    curl /registration/xxxxxxxxxx/confirm/yyyyyyyyyy

This retrieves the account ID.  Save it.  This is pretty important, just like your password and the MFA seed.


Creating API Keys
-----------------

API keys are necessary in order to tokenize information.

    cd examples   # In case you were not there before
    unset HISTFILE  # Turn off shell history so your password isn't stored
    ./create-api-keys.js --account=ACCOUNT_ID \
        --description="Your description for these keys" \
        --mfa=THE_MFA_SEED --password=REALLY_GOOD_PASSWORD

This will just spit out a set of keys.  They consist of a code and a secret.  The code can be shared with others but keep the secret private!  The secret is used for signing requests.


Tokenization, Detokenization
----------------------------

Signing a request to OpenToken.io is easier than AWS but based on the same principles.  There's a great request to do this for you as well.  Let's tokenize the file `tokenize-me.txt`.

    cd examples   # In case you were not there before
    unset HISTFILE  # Turn off shell history so your password isn't stored
    export OPENTOKEN_CODE=YOUR_API_CODE
    export OPENTOKEN_SECRET=YOUR_API_SECRET
    ./signed-request.sh POST /account/ACCOUNT_ID/token/ text/plain tokenize-me.txt

This will write out the response.  Inside there will be a `Location` header, with the appropriate portions changed into real IDs.

    Location: /account/ACCOUNT_ID/token/zzzzzzzzz

To retrieve a token you issue a similar signed request

    ./signed-request.sh GET /account/ACCOUNT_ID/token/zzzzzzzzzz > content.txt


