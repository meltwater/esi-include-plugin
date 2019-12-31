const index = require('./index');

const fs = require('fs');
const path = require('path');

test('Runs with no errors, in prod mode, with basic config', async () => {
  // Make an html file
  let errors = [];
  let filename = './tmp/myHtml.html';
  let html = '<html><head></head><body><!--esi-include-webpack-plugin name=includeThing--></body></html>';
  fs.mkdirSync(path.dirname(filename), {recursive: true});
  fs.writeFileSync(filename, html, (err) => {
    if(err) {
      console.error(err);
      errors.push(err);
    }
  })
try{
  await index({
    files: filename,
    verbose: false,
    esi: [
      {name: 'includeThing', src: 'http://mything.com/', noStore: true, onError: 'continue', authorization: 'ImAFakeToken', maxwait: '500'},
    ]
  });
} catch(error) {
  console.error(error);
  errors.push(error);
}
  
expect(errors.length).toBe(0);
});


