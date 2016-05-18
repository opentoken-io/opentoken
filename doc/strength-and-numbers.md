Strength and Numbers
====================

There are a lot of questions from people wondering how secure the encryption is or exactly what is meant when we say things are "hard to guess".


Numbers
-------

Encryption deals with numbers that are very big.  So big, in fact, that humans have a hard time understanding just how large they are.  They get so big that one must use scientific notation to represent them!  In order to help put things into a human's perspective, here are some large numbers and a rough equivalent.

I'm using "E" instead of "×10^" notation.  The number after the E is the number of places the decimal should be moved if you want a human representable number.

* 1E3: One thousand (10^3 and 1,000 are other forms).  A Twinkie (9.9 cm) that is one thousand times larger would be taller than the [Knights of Columbus Building](https://en.wikipedia.org/wiki/Knights_of_Columbus_Building_(New_Haven,_Connecticut)) (New Haven, Connecticut) when stood on end (Twinkie would be 99 meters tall and the 23-floor building is 98 meters).

* 1E6: One million.  A 1 followed by six 0's.  A grain of sand (2mm) enlarged a million times would be 1.24 miles across (2 km).

* 1E9: One billion.  A fountain pen cap (55 mm) enlarged to be one billion times larger would be able to hold the Earth inside (55,000 kilometers for the pen cap, a mere 12,742 km for Earth).

* 8.0E27:  8 octillion.  The estimated number of grains of sand in the Sahara.

* 1.33E50:  Approximation for the number of atoms in the Earth.

* 4E78 - 4E82: Estimate for the number of atoms in the observable universe.


Random Tokens
-------------

Account IDs, tokens and other randomly generated things on the system generate a secure hash of a particular length.  By default we use 24 random bytes of information, which translates into 32 bytes of Base64 encoded data.  Trying to guess one of these generated identifiers is very hard.  In 24 bytes there are 192 bits (24 * 8 = 192).  All of them have random values (0 or 1).  That means there are 2^192 possible acounts.  Roughly 6.2E57 accounts are possible.  That's more than one account for each atom on a million Earths.

Token IDs are similarly random.  Each of the 6.2E57 accounts can store 6.2E57 tokens when we generate the token IDs.

The reason these figures are important is because we encrypt data with the real account ID and the token ID.  Even we can not read your data until the moment you are requesting it!  Keeping it safe from everyone, including us, is very important.


Encryption Strength
-------------------

Now let's figure out some ballpark estimates for encryption.  As of right now, computers can generate some 2.5E7 (250 million) MD5 hashes per second.  When you build a specialized computer, it can work out 1.8E11 (180 billion) per second.  We've figured out some timing of attacks for [another project](https://github.com/tests-always-included/password-strength/blob/master/doc/strength-levels.md).  In comparison, my machine can calculate approximately 133,000 hashes per second for 1024 bytes of random data using one core using standard hashing libraries.  So, for the sake of argument, let us assume a specialized machine and highly optimized code could crack 1.4E6 (1.4 million) times faster than mine.

As a comparison, I can decrypt aes-256-cbc about 66,000 times per second using 1024 bytes of random encoded data on just a single core of my machine.  Again, assuming a tailored machine, I estimate that it could decrypt 1.4 million times more than me, or 9.24E10 possibilities per second.  Decrypting blowfish with similar parameters results in 19,400 decrypts per second.  Scaling that to supercomputer size, that is 2.7E10 decryption attempts per second.

One can never truly estimate the strength of data by merely inspecting the algorithm.  It is far more likely that keys are compromised or data is accidentally encoded in such a way that would make decryption much faster.  For instance, Zip files were initially plagued with weak random number generators and they even included a little too much [information in the header](http://blog.rubypdf.com/fcrackzip.html#lbAF), allowing hackers to be able to skip testing most passwords through the more computationally expensive decryption process.

In order to attack the algorithms used and without knowing any other weaknesses, we must attack the keys.  We do this by trying each key and attempting to decode the data.  When stored by OpenToken.io, the data is doubly encrypted with different algorithms and different keys.  For this example we are going to attempt to break into a bit of data where AES and whirlpool are both used for encryption.

First, we must break AES.  The key size that is used is 32 bytes.  That's 2^256 possibilities, which is about 1.16E77.  With the above supercomputer we can fully scan the keyspace in 4E58 years.  Really, we'd only have to scan about half of that in order to get a 50% chance of finding the key.  Assuming each atom of Earth was one of these supercomputers, it would still take 298,579,912 years to find it.

Whirlpool uses a similarly sized key of 32 bytes.  Again, the number of possibilities for scanning the entire keyspace are the same.  Because it's implemented slower, the supercomputer now takes 1.35E59 years and finally will scan all possibilites after 1 billion years (with a 50% chance after 500 million years).

Because the records are stored as double-encrypted payloads, even huge advances in bypassing some of the encryption will not help tremendously because multiple different encryption mechanisms are employed.

On a final note, assume that you have an extremely valuable secret, you've found weaknesses in the different encryption mechanisms in place, you have infinite funds to build computers and everyone wants you to succeed.  The world is attempting to crack one of the secrets stored by OpenToken.io.  Given the absurdity of the examples above, it would still take nearly two billion years to get your secret.  To put that in perspective, the sun is estimated to last another 5 billion years but Earth is not.

And after you have obtained that one secret, you would not have cracked any other secret on OpenToken.io.
