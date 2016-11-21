Deployment to Elastic Beanstalk
===============================

Tools required:

* git
* gpg
* node and npm
* zip

This guide is a bit terse and assumes that your hard drive is encrypted. We don't want encryption keys leaking out to the world because of a stolen laptop.

1. Download and extract. This automatically creates an `opentoken-master` folder.

        curl -s https://codeload.github.com/opentoken-io/opentoken/tar.gz/master | tar xvzf -

2. Install modules.

        cd opentoken-master
        npm install

3. Decrypt the encryption key and the override files.

        gpg --decrypt encryption.key.asc > encryption.key
        gpg --decrypt override.json.asc > override.json

4. Make sure tests pass.

        npm test

5. If that fails, **stop here**.
6. Prune the development dependencies and clean out unnecessary files.

        npm prune --production
        rm -rf coverage

7. Create an archive.

        zip -r9 ../opentoken-$(date --utc +"%Y-%m-%d-%H-%M-%S").zip ./

8. Login to the [AWS Console](https://opentoken-io.signin.aws.amazon.com/console).
9. Upload the archive to Elastic Beanstalk.
10. Wipe the release folder or at least delete `encryption.key`.

Isn't it sweet using AWS for deployment?

This whole process can be automated as well, but that's a task for another day.
