Deployment to Elastic Beanstalk
===============================

Tools required:

* git
* gpg
* node and npm
* zip

This guide is a bit terse and assumes that your hard drive is encrypted.  We don't want encryption keys leaking out to the world because a laptop was stolen.

1. Clone the repository somewhere new.

        git clone https://github.com/opentoken-io/opentoken.git release

2. Install modules.

        cd release
        npm install

3. Decrypt the encryption key and the override files.

        gpg --decrypt encryption.key.asc > encryption.key
        gpg --decrypt override.json.asc > override.json

4. Make sure tests pass.

        npm test

5. If that fails, **stop here**.
6. Create an archive.

        zip -r9 ../opentoken-$(date --utc +"%Y-%m-%d-%H-%M-%S").zip * .[^.]* --exclude .git/\* --exclude coverage/\*

7. Login to the [AWS Console](https://opentoken-io.signin.aws.amazon.com/console).
8. Upload the archive to Elastic Beanstalk.
9. Wipe the release folder or at least delete `encryption.key`.

Isn't it sweet using AWS for deployment?

This whole process can be automated as well, but that's a task for another day.
