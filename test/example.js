var api = require('../')
var ghauth = require('ghauth')

ghauth({
  configName: 'gh-api-stream-test',
  scopes: ['user', 'repo']
}, function (err, auth) {
  if (err) throw err
    
  // get a single JSON response
  api('/repos/mattdesl/gh-md-urls/readme', { token: auth.token })
    .on('data', function (ev) {
      console.log('README.md:', ev.html_url)
      
      // stream by rows, pick a string inside of each row
      api('/repos/mattdesl/gh-md-urls/issues', { 
        token: auth.token,
        rows: '*.user.login',
        query: {
          state: 'all'
        }
      }).on('data', function (name) {
        console.log('issue: @' + name)
      })
    })
})
  