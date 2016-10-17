Record Encryption
=================

This covers the technique used for encrypting records and the reasoning behind those choices.  Configuration of the encryption methods is [covered separately][encryption config].

All data is stored in the [storage engine] encrypted.  Twice.  We use a layered encryption scheme to safeguard all data.  This is in addition to any encryption that is offered by the storage engine, such as how S3 records are encrypted when saved.


Layered Encryption
------------------

The technique of layered encryption is where you take some information and encrypt it multiple times.  You can provide the encryption keys to separate parties in order to keep the encrypted data more secure.  A different approach is to use a single secret that you build from enough information from various people; see [Shamir's Secret Sharing](https://en.wikipedia.org/wiki/Shamir%27s_Secret_Sharing).

Layered encryption provides benefits.  For instance, PCI DSS 3.2 has some rules governing key rotation in section 3.6 that could apply.  The service is able to decrypt the outer layer and rekey the stored information.  Also, some information may be acceptable to be seen again without decrypting the entire record.  As an example, the stored account record holds the MFA key and hashed password in the inner layer to be safe.  The outer layer encrypts the email address, so emails to the user may be sent before their password expires.


Keyed Hash Message Authentication Code (HMAC)
---------------------------------------------

Having encrypted data may not be enough.  It's true an attacker would need to be pretty skilled in order to inject a different payload in an encrypted message, but the possibility exists.  Random bytes, given enough chances, could alter a message so that it decrypts fine but the resulting data is corrupt.  To help thwart that possibility, all encrypted data has a cryptographic hash calculated and stored with the encrypted data.  The hash function uses the encryption key to generate its seed and the encryption key is [quite big](strength-and-numbers.md).  If some bytes were able to be changed, there is only an astronomically small chance the alteration would not be detected.


Encryption Process
------------------

Incoming data is known as the "plaintext".  This does not mean the client is forced to send us unencrypted information.  Plaintext means it is the desired information when we are done decrypting.

The plaintext is encrypted according to the [encryption config].  This is the "ciphertext".  At the same time, the encryption options are built for this record.  Those options are saved in the record so it can be decrypted later, even if the [encryption config] changes.  The encryption requires an initialization vector (IV), which is simply random data.  It is used to pick a random starting position for the cipher.

    iv = random_data()
    ciphertext = encrypt(iv, plaintext)

Next, the HMAC is generated.  It is a hash function that uses a seeded algorithm and the seed is generated randomly.  This later becomes the token ID, account ID or other identifier used in the system.  (Don't worry, we do not log it.)

    id = random_identifier()
    hmac_seed = pbkdf2(id)
    hmac = create_hmac(hmac_seed, cipher_options + iv + ciphertext)

Now we have enough to create the inner layer of the encryption.

    inner_layer = cipher_options + hmac + iv + ciphertext

Excellent.  One layer is done.  Now, for the second one we do almost the exact same thing.  We'll feed in the ciphertext as though it is the plaintext and we'll use the server's encryption key as the ID instead of using a random identifier.

    iv2 = random_data()
    ciphertext2 = encrypt(iv2, inner_layer)
    hmac_seed2 = pbkdf2(server_key)
    hmac2 = create_hmac(hmac_seed2, cipher_options2 + iv2 + ciphertext2)
    outer_layer = cipher_options2 + hmac2 + iv2 + ciphertext2

This outer layer data is what's saved to the [storage engine].


[encryption config]: encryption.md
[storage engine]: storage.md
