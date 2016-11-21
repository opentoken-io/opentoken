Link Relations
==============

Link relations describe how two documents relate to each other.

It is important to navigate through the links. Do not remember nor code against URIs because they are subject to change at any time. Always follow `Link` headers.


Standard Links
--------------

Each response will have at least two links. They are a `self` link and an `up` link to the `self-discovery` endpoint.

    Link: <...>; rel="self"

A `self` link is always returned with the resource. It will reflect the URI requested. It is there for completeness. If resources are embedded within others, these headers would be carried along so the embedded resources would be able to be identified.

    Link: </>; rel="up"; title="self-discovery"

This link relation will allow the API consumer to always return to the root of the service and find all the other services that we offer.


Additional Link Relations
-------------------------

    Link: </healthCheck>; rel="service"; title="health-check"
    Link: </registration>; rel="service";
        profile="/schema/registration/register-request.json";
        title="registration-register"

The starting point for services are advertised with a `service` link. Service titles are consistent throughout the service and will not change unless the service changes drastically.

When there is a `profile` attribute, that defines the data that should be sent in the request. Typically, a POST request should be used, with a 201 response code for successful creation. At times, such as when looking up an account, there is a `profile` attribute and all the data fields are in the URI. Situations like that would indicate that the requester should use a GET instead of POST.

    Link: </registration/NrV3togfnHmutqNVIhUm0Mg7/qr/>; rel="item";
        title="registration-secure-qr"

When there is a list or collection of related documents, there will be `item` links on the parent document to each of the child documents.

    Link: </registration/NrV3togfnHmutqNVIhUm0Mg7/>; rel="edit";
        profile="/schema/registration/secure-request.json";
        title="registration-secure"

An `edit` link relation indicates the current document is able to be changed. This will include a `profile` attribute citing a JSON schema file. The payload that is expected will be described and validated against the JSON schema. Successful updates will return a status code of 200.

    Link: <...>; rel="related"; title="signature-information"

If there is a relation to another document and there is not a more appropriate link relation, `related` is used.


Templated Links
---------------

    Link: </account/{accountId}/login>; rel="service";
        profile="/schema/account/login-request.json";
        templated="true"; title="account-login"

The link above is a templated URI. The `{accountId}` parameter is defined in the JSON Schema referenced in the `profile` attribute. The client must be able to parse and use templated URIs. For instance, to login to the account ID `VD1kTObHqH36Px3KXMv0JoEi`, the URI would look like this:

    https://api.opentoken.io/account/VD1kTObHqH36Px3KXMv0JoEi/login

This endpoint has additional properties in the schema, so login requests will need to be sent via a POST.


Further Reading
---------------

The link relations we use are selected from the standard list of [link relations from IANA](http://www.iana.org/assignments/link-relations/link-relations.xhtml).

Link attributes are discussed more in the [JSON Hypertext Application Language (HAL)](https://tools.ietf.org/html/draft-kelly-json-hal-06) specification.

Profiles are written in [JSON Schema](http://json-schema.org/documentation.html). Link attributes are also covered in [JSON Hyper-Schema](http://json-schema.org/latest/json-schema-hypermedia.html).

[URI Template (RFC 6570)](https://tools.ietf.org/html/rfc6570) explains how URIs can be templated, which is used in the `Link` headers when the `templated` property is set to `"true"`.

[Web Linking (RFC 5988)](https://tools.ietf.org/html/rfc5988) shows how the `Link` header works. Additional information regarding the structure of the header and how multiple links are allowed is covered neatly in a [GitHub issue](https://github.com/kennethreitz/requests/issues/741).
