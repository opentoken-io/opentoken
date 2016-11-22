OpenToken Configuration - Override JSON
=======================================

When starting the server, use `--override=PATH_TO_FILE` to specify an override JSON file. It may contain all of the same properties as the [normal configuration][config]. The original `config.json` is deep merged with the override, so the settings in the override will take precedence.

The override is optional and exists only to make it easier to deploy this codebase while also keeping your changes external to the repository.


[config]: ./config.md
