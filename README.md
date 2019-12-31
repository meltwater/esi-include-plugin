# esi-include-plugin
[![Build Status](https://drone.meltwater.io/api/badges/meltwater/esi-include-plugin/status.svg)](https://drone.meltwater.io/meltwater/esi-include-plugin)

General plugin logic for esi:include script or source injection

## What is it? 
This generic "plugin" is to handle esi:include injection based on configuration. There are two main "modes" in which this utility will replace tags in html. 
* Production Mode: The plugin will replace the html tags with the correctly configured esi:include tag.
* Local or Dev Mode: Here lies the great strength of this plugin. When running in a local or dev mode the plugin will fetch the configured remote src and inject the contents in place of the tag, effectively emulating the esi:include logic. 

## How to use it? 
Use a script like the following example and call it as part of an npm script, for example add it to start script of a stencil project like this:
``` 
"start": "node scripts/esi-include.js && stencil build --dev --serve"
``` 


```javascript
// scripts/esi-include.js
(async function esiIncludeScript(){
  const esiIncludeModule = require('@meltwater/esi-include-plugin');

await esiIncludeModule({
  files: ['dist/index.html'],
  verbose: false,
  esi: [
    {name: 'includeThing', src: 'http://myincludeurl.com/asset', noStore: true, onError: 'continue', authorization: 'ImAFakeToken', maxwait: '500'},
  ]
});
})();

```

In your html place the following comment tag where you'd like the injection to take place `//dist/index.html`
```html
<!--esi-include-webpack-plugin name=includeThing-->
```

A more advanced example that can handle more fun stuff like specifying files and handling different source file urls based on a stage.
```javascript 
(async function esiIncludeScript(){
  const esiIncludeModule = require('@meltwater/esi-include-plugin');
  const argv = require('yargs').argv;

  let config = argv.stage === 'prod' ?
  {
    includeThing: 'https://mystagingurl.com/asset'
  } : {
    includeThing: 'https://myprodurl.com/asset'
  }

  if(argv.files) {
    config.files = argv.files.split(',')
  } else {
    config.files = ['./src/index.html']
  }

await esiIncludeModule({
  files: config.files,
  verbose: false,
  esi: [
    {name: 'includeThing', src: config.includeThing, noStore: true, onError: 'continue', authorization: 'ImAFakeToken', maxwait: '500'},
  ]
});
})();

```
Then the command in the call to the script can have extra arguments 
```
"build": "node scripts/esi-include.js --stage=staging --files='some/other/path/index.html' && stencil build"
```