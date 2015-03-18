asa-password-encrypt
====================

Simple web page and Javascript to take plaintext credentials and generate an encrypted password suitable for a Cisco ASA (or PIX).

Although RADIUS & TACACS+ can be used for AAA there are usually occasions where the local database is used. The purpose of this code is for those occasions. It is allows a user to generate an encrypted password that can be entered in to the device config without the administrator knowing the plaintext. This avoid the potential situation where an administrator knows the user's password because a user does not have the privileges to change the password.

The encrypted password can be directly entered into the device configuration. For example:

    username pengujian password uR6OT85Pkj4/O13E encrypted

## Caveats ##
* If you as an administrator do not see the password then you do not know whether it meets password policies. This code in its current form does not enforce any password policy but it is likely an important consideration.
* The encrypted form of the password should not be considered super-strong. I am certainly dubious about the cryptographic strength of this approach - it certainly seems to have some bad aspects. It is useful to hide the password plaintext but should not be widely distributed, in the same was that one would not distribute the plaintext itself.
* The output from this code has only been tested (lightly) to work with ASA software 8.2(3). I believe it should work fine with other versions but I have not verified this.
* Not all edge cases have been tested e.g. I have not tested the behaviour with 3 character usernames

The Cisco ASA tested reports that usernames and passwords must be longer than 3 characters and passwords no longer than 32 characters. 

## Background ##

Details of the Cisco PIX password encryption mechanism have been disclosed for a long time:
* http://www.oxid.it/downloads/pix_passwd.txt
* http://www.perlmonks.org/index.pl?node_id=797623

The basic mechanism is:
* Salt password by appending the first 4 characters of the username
* Pad with nulls or trim to 16 characters
* MD5 hash (for this I use the BSD Licensed code from http://pajhome.org.uk/crypt/md5, included in this repo)
* Sort of base64 encode
 * The usual encoding technique is to work with 24-bit input blocks, creating 4 printable characters identified by 6-bit groups from that 24-bit block. See [RFC4648](https://tools.ietf.org/html/rfc4648).
 * The technique here is to work with 32-bit blocks of the hash, creating 4 printable characters from 6-bit groups and discarding the remaining bits. 
 * The encoding character set is as per _crypt_to64 from the [FreeBSD crypto libraries](http://svnweb.freebsd.org/base/head/lib/libcrypt/misc.c?view=markup)

Since the time of the disclosure above newer ASA/PIX software versions have increased the allowed password length from 16 to 32 character:
* http://www.cisco.com/en/US/docs/security/asa/asa70/release/notes/asarn705.html#wp286405

A small amount of testing shows that the principle for the newer software seems to be similar, with the following details:
* If the input password is <=12 characters then the approach is as above
* If the input password is 13 - 28 characters then proceed as above but pad/trim to 32 characters
* If the input password is 29 - 32 characters then do not salt and pad/trim to 32 characters
