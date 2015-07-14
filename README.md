# gh-api-stream

[![stable](http://badges.github.io/stability-badges/dist/stable.svg)](http://github.com/badges/stability-badges)

Streams paginated JSON from a GitHub API. 

```js
var api = require('gh-api-stream')

// prints all my follower's usernames
api('/users/mattdesl/followers')
  .on('data', function (follower) {
    console.log(follower.login)
  })
```

PRs/suggestions welcome.

## Install

```sh
npm install gh-api-stream
```

## Examples

Below is an example of paging through all `'open'` issues in a repo. It parses the JSON by row rather than buffering it all at once. Uses [ghauth](https://github.com/rvagg/ghauth) for easy authentication.

```js
var api = require('gh-api-stream')
var ghauth = require('ghauth')

ghauth({
  configName: 'my-test', 
  scopes: ['user', 'repo']
}, function (err, data) {
  if (err) throw err
  
  api('/repos/mattdesl/budo/issues', {
    query: {
      state: 'open'
    },
    rows: true
  }).on('data', function (issue) {
    console.log(issue.title)
  }).on('end', function () {
    console.log("Done!")
  })
})
```

See [test/example.js](test/example.js) for another example.

## Usage

[![NPM](https://nodei.co/npm/gh-api-stream.png)](https://www.npmjs.com/package/gh-api-stream)

#### `stream = ghApiStream(api, [opt])`

Returns an object stream that emits `'data'` results from the request.

`api` is a String for the API like `'/repositories'` or `'/orgs/:owner/repos'`.

The options:

- `token` (String)
  - optional authentication token
- `pages` (Number)
  - if specified, will limit the request to no more than N pages. Otherwise streams until we have no remaining pages
- `rows` (Boolean|String|Array)
  - if `true`, parses the JSON in rows, emitting a `'data'` event for each row. If `false`, it will buffer and emit the entire JSON
  - Strings and Arrays are passed to [JSONStream](https://github.com/dominictarr/JSONStream) `parse` path, e.g. `'*.user.login'`
  
Other options are passed to [got](https://www.npmjs.com/package/got), like `query`, `method` and `body`. Requests use `'https://api.github.com/'` as a URL base.

#### `stream = ghApiStream.url(url, [opt])`

You can use this to pass a full URL to your API endpoint. The options are the same as above.

```js
var api = require('gh-api-stream')
var stream = api.url('https://my-fancy-github.com/repositories')
```

## License

MIT, see [LICENSE.md](http://github.com/Jam3/gh-api-stream/blob/master/LICENSE.md) for details.
