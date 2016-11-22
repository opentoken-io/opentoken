Email
=====

This backend lets you set up how to send emails out of OpenToken.


Configuration
-------------

Inside the [main config][config], there is an `email` object whose properties configure the backend.


### `email.engine`

Engine to use for emails. Engines each require their own properties to be set in the config. Currently only `ses` is allowed.


### `email.from`

Email address that originates the messages.


SES Backend
-----------

Amazon's hosting platform includes an email delivery service called Simple Email Service (SES). Sending messages using SES requires additional configuration settings.

You may use the `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY` environment variables instead of specifying the keys directly in the config file.


### `email.ses.accessKeyId` and `email.ses.secretAccessKey`

Your SES keys for AWS, used for communicating directly with the SES endpoint inside AWS.


### `email.ses.region`

What SES region you wish to use.
