HTTPS
=====

HTTPS for Open Token can be enabled by adding/updating a configuration option in config.json.

The default "https" property doesn't need to exist or can be set to "false". This will tell the server not to use HTTPS for its connections and therefore will not set it up when starting.

    {
        "server": {
            "port": 8443,
            "https": false
        }
        ...
    }

If the server is going to need/want HTTPS then there are a few things to do.

First the server will need to a Private Key file and a Certificate file. These can be generated for testing and development.

## Generating SSL Files for Testing

In order to generate the files needed for testing and development there are several commands which need to be ran. These commands were pulled from [The Most Common OpenSSL Commands](https://www.sslshopper.com/article-most-common-openssl-commands.html).

    openssl req -out CSR.csr -new -newkey rsa:2048 -nodes -keyout privateKey.key

There will be several prompts for information: Below is an example for getting it to work using localhost.

    Country Name (2 letter code) [AU]:US
    State or Province Name (full name) [Some-State]:Washington
    Locality Name (eg, city) []:Redmond
    Organization Name (eg, company) [Internet Widgits Pty Ltd]:Some Company
    Organizational Unit Name (eg, section) []:A Division
    Common Name (e.g. server FQDN or YOUR name) []:localhost
    Email Address []:some.one@example.net

    There are a few "extra" options, these aren't required to make the site work.
    A challenge password []:Don't enter one as Express HTTPS will not have a way of entering the passphrase when navigating to the server.
    An optional company name []: If there is an optional company name enter it here.

This will create a Private Key file and a Certificate Signing Request file. We aren't done yet though, we still need to generate a Self-Signed Certificate file.

    openssl req -x509 -sha256 -nodes -days 365 -newkey rsa:2048 -keyout privateKey.key -out certificate.crt

The same questions will be prompted from above except for the "extra" ones.

## Updating Config.json

Once the keys are generated they can be added under the "https" property under the server being configured. Only two of the SSL files generated are needed for testing.

    {
        "server": {
            "port": 8443,
            "https": {
                "keyFile": "path/to/key/file.key",
                "certFile": "path/to/cert/file.crt"
            }

        }
        ...
    }

When set, the server will attempt to load these files and start the server up using HTTPS.

An easy way to see if this works is to go to https://hostname:8443 (replace `hostname` with your server's name or use `localhost` if developing on your own machine) and you will get a warning about not being able to verify the certificate, but you will have an https connection.

Optionally you can run the command:

    openssl s_client -connect hostname:port

This will provide information about the connection and whether it detects certificates are installed.
