var parseLink = require('parse-link-header')
var through = require('through2').obj
var json = require('JSONStream')
var request = require('got')
var assign = require('object-assign')

module.exports = ghApiStream
module.exports.endpoint = ghStream

function ghApiStream (api, opt) {
  if (typeof api !== 'string') {
    throw new TypeError('must specify API string')
  }
  api = api.replace(/^\//, '')
  return ghStream('https://api.github.com/' + api, opt)
}

function ghStream (url, opt) {
  if (typeof url !== 'string') {
    throw new TypeError('must specify URL string')
  }

  opt = assign({}, opt)
  var count = 0
  var rows = opt.rows
  if (rows === true) {
    rows = [true]
  }
  
  var pages = opt.pages
  if (typeof pages === 'number' && pages < 0) {
    throw new TypeError('pages must be >= 0')
  }

  var stream = through()

  if (pages === 0) { // no pages
    stream.push(null)
    return stream
  }
  
  opt.headers = assign({}, opt.headers, {
    accept: 'application/vnd.github.v3+json',
    'user-agent': 'gh-api-stream'
  })
  
  if (opt.token) {
    opt.headers.authorization = 'token ' + opt.token
  }
  
  // https://developer.github.com/v3/#http-verbs
  if (/^put$/i.test(opt.method) && !opt.body) {
    opt['content-length'] = 0
  }
  
  opt.json = !rows
  if (rows) {
    streamRows(url)
  } else {
    streamObject(url)
  }
  
  return stream
  
  function streamObject (uri) {
    request(uri, opt, function (err, body, response) {
      if (err) return stream.emit('error', err)
      stream.push(body)
      next(response, streamObject)
    })
  }
  
  function streamRows (uri) {
    var response
    request(uri, opt)
      .on('error', function (err) {
        stream.emit('error', err)
      })
      .once('response', function (res) {
        response = res
      })
      .once('end', function () {
        next(response, streamRows)
      })
      .pipe(json.parse(rows))
      .pipe(stream, { end: false })
  }
  
  function next (response, nextFn) {
    count++
    // undefined/null pages defaults to all
    if (typeof pages === 'number' && count >= pages) {
      return stream.push(null)
    }
    
    var links = parseLink(response.headers.link)
    if (links && links.next) {
      // the next link will contain our original query
      delete opt.query
      return nextFn(links.next.url)
    }
    stream.push(null)
  }
}