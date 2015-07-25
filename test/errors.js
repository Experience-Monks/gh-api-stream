var ghApi = require('../')
var test = require('tape')

require('ghauth')({
  configName: 'gh-api-stream-test',
  scopes: ['user', 'repo']
}, function (err, data) {
  if (err) throw err

  test('handles an error in buffered mode', function (t) {
    t.plan(1)
    ghApi('/repos/foobar/beepboop/contents/package.json', {
      token: data.token
    }).on('data', function () {
      t.fail('should not have received data')
    }).on('end', function () {
      t.ok(true, 'finished')
    }).on('error', function (err) {
      t.ok(err, 'got error')
    })
  })


  test('handles an error in streaming mode', function (t) {
    t.plan(1)
    ghApi('/repos/foobar/beepboop/contents/package.json', {
      token: data.token,
      rows: true
    }).on('data', function () {
      t.fail('should not have received data')
    }).on('end', function () {
      t.ok(true, 'finished')
    }).on('error', function (err) {
      t.ok(err, 'got error')
    })
  })
})