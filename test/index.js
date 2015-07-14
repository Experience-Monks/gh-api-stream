var ghApi = require('../')
var test = require('tape')

require('ghauth')({
  configName: 'gh-api-stream-test',
  scopes: ['user', 'repo']
}, function (err, data) {
  if (err) throw err

  test('zero pages works', function (t) {
    t.plan(1)
    ghApi('repositories', {
      token: data.token,
      pages: 0
    }).on('data', function () {
      t.fail('should not receive data')
    }).on('end', function () {
      t.ok(true, 'finished')
    })
  })

  test('buffers full content from GitHub API', function (t) {
    t.plan(2)
    ghApi('repositories', {
      token: data.token,
      pages: 1
    }).on('data', function (ev) {
      t.equal(ev.length, 100, 'gets 100 items')
    }).on('end', function () {
      t.ok(true, 'finished')
    })
  })

  test('allows rows to be a json pattern', function (t) {
    t.plan(1)
    var followers = []
    ghApi('/users/mattdesl/followers', { 
      token: data.token,
      rows: '*.login' 
    }).on('data', function (data) {
      followers.push(typeof data)
    }).on('end', function () {
      t.equal(followers.every(function (x) {
        return x === 'string' 
      }), true, 'all strings')
    })
  })

  test('streams in JSON as rows', function (t) {
    t.plan(2)
    var types = []
    ghApi('repositories', {
      token: data.token,
      rows: true,
      pages: 1
    }).on('data', function (ev) {
      types.push(typeof ev.html_url)
    }).on('end', function () {
      t.equal(types.length, 100, 'got 100 items')
      t.equal(types.every(function (x) {
        return x === 'string'
      }), true, 'each data was JSON object')
    })
  })

  test('streams in paginated JSON as rows', function (t) {
    t.plan(1)
    var repos = []
    ghApi('repositories', {
      token: data.token,
      pages: 3,
      rows: true
    }).on('data', function (ev) {
      repos.push(ev.name)
    }).on('end', function () {
      t.equal(repos.length, 300, 'wow. haz much repos.')
    })
  })

  test('streams in paginated JSON as rows infinitely', function (t) {
    t.plan(1)
    var repos = []
    ghApi('/orgs/nodeschool/repos', {
      token: data.token,
      rows: true
    }).on('data', function (ev) {
      repos.push(ev.name)
    }).on('end', function () {
      t.ok(repos.length > 50, 'many nodeschools. indeed.')
    })
  })

  test('buffers full content as pages', function (t) {
    t.plan(2)
    var repos = []
    ghApi('/users/mattdesl/repos', {
      token: data.token,
      query: {
        type: 'owner'
      },
      pages: 3,
      rows: false
    }).on('data', function (ev) {
      repos = repos.concat(ev)
    }).on('end', function () {
      t.equal(typeof repos[0].name, 'string')
      t.ok(repos.length > 50, 'many repos')
    })
  })
})
