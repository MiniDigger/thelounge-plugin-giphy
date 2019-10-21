# thelounge-plugin-giphy [![build status](https://github.com/MiniDigger/thelounge-plugin-giphy/workflows/Build/badge.svg)](https://github.com/MiniDigger/thelounge-plugin-giphy/workflows/build) [![npm downloads](https://img.shields.io/npm/dt/thelounge-plugin-giphy.svg)](https://www.npmjs.com/package/thelounge-plugin-giphy) [![npm versions](https://img.shields.io/npm/v/thelounge-plugin-giphy.svg)](https://www.npmjs.com/package/thelounge-plugin-giphy) [![licence mit](https://img.shields.io/github/license/MiniDigger/thelounge-plugin-giphy.svg)](https://github.com/MiniDigger/thelounge-plugin-giphy/blob/master/LICENSE)

Simple plugin for the irc client [thelounge](https://thelounge.chat) that allows you to quickly look up giphy-gifs

# Installation

- If you have installed thelounge via NPM/Yarn:

   `thelounge install thelounge-plugin-giphy`
- If you have installed thelounge via source:

   `node index.js install thelounge-plugin-giphy`

# Usage

`/giphy search <term>` -> Search a gif  
`/giphy random` -> Get a random gif

# Setup

You will need an API key to interact with giphy. You can create an app and obtain an api key [here](https://developers.giphy.com/dashboard/?create=true)
(select I only want to use the GIPHY API, the name and description don't matter).

Once you got the key, enter it via `/giphy key <your-api-key>`.  
Then you are all set.

# Content Rating

You can disallow gifs with certain content ratings using the `/giphy rating` command.
See [this page](https://developers.giphy.com/docs/optional-settings#rating) for more info

# Development

Currently thelounge doesn't offer a way to install packages from source without npm, 
thats why you have to do it manually.

The easiest way is installing thelounge locally and adding this plugin as a new package in the THELOUNGE_HOME/packages dir.
For that you need to have a package.json in that packages dir that looks kinda like this:
```json
{
    "private": true,
    "description": "Packages for The Lounge. All packages in node_modules directory will be automatically loaded.",
    "dependencies": {
        "thelounge-theme-mininapse": "2.0.15",
        "thelounge-plugin-shortcuts": "1.0.1",
        "thelounge-plugin-giphy": "1.0.1"
     }
}
```
the important thing in the name here.

You then need to create a folder with that name in the node_modules sub dir.
We then need to place our index.js and package.json in that dir. 
You can either do that manually by just copy pasting it, but that would involve copy pasting it for every change.
I would recommend symlinking the files from the project into the packages folder, kinda like this:
```
ln package.json ../thelounge-home/packages/node_modules/thelounge-plugin-giphy/package.json
ln index.js ../thelounge-home/packages/node_modules/thelounge-plugin-giphy/index.js
```
You can then just edit and commit the files in the project dir and restart thelounge
 on every change you do and the changes will be picked up.
 
# Attribution

![https://giphy.com](img/giphy.png)