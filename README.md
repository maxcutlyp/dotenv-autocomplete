# dotenv-autocomplete

This extension provides auto-completion to any `process.env` mentions inside a JS/TS file, from environment variables declared in `.env.*` files at the root of your project.

## Install

### From the Extension Marketplace

Just search for `maxcutlyp.dotenv-autocomplete` in the extensions panel, and click install.

### From Source

1. Install `vsce` with `npm install -g vsce`
2. Clone this repo with `git clone https://github.com/maxcutlyp/dotenv-autocomplete`
3. `cd` into the newly created folder and run `npm install` to install all the necessary packages for the extension to build
4. Run `vsce package` - this will generate a file ending in .vsix
5. Drag the generated file into the Extensions panel in VSCode (or run `code --install-extension <file-name>.vsix`)

## Requirements

Any version of VSCode should do the trick. Let me know if anything goes south while using this extension.

## Release Notes

See [CHANGELOG.md](CHANGELOG.md)