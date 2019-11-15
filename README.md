# Scrapise
![npm](https://img.shields.io/npm/v/scrapise?style=flat-square) ![NPM](https://img.shields.io/npm/l/scrapise?style=flat-square)

Scraper + Promise = Scrapise. A promise based scraping library.

## Installation
```sh
$ npm install --save scrapise
```

## Documentation
### Api
Scrapise requires two arguments, url and schema then returns a promise with the parsed result.
```js
const scrapise = require('scrapise')

const schema = {
  commits: '.numbers-summary .commits .num'
}

scrapise('https://github.com/eremt/scrapise', schema)
  .then(response => {
    console.log(response)
  })
//=> { "commits": "3" }
```
### Schema
The schema is an object where the values represent different types of selectors.

All examples below use the following markup.
```html
<ul>
  <li>
    <a href="https://my-domain.com/commits/2">
      <span class="message">changed something</span>
      <span class="author">John Doe</span>
    </a>
  </li>
  <li>
    <a href="https://my-domain.com/commits/1">
      <span class="message">initial commit</span>
      <span class="author">John Doe</span>
    </a>
  </li>
</ul>
```

**String**
The simplest selector is a `string` and will be treated as a CSS selector. It returns the text content of the first match, to get all matches wrap the selector in an `array`.
```js
const schema = {
  last: '.message'
}
//=> {
//     "last": "changed something"
//   }
```
**Function**
The `function` will be treated as a callback with 2 arguments, the cheerio object and a context if it exists. Refer to the [cheerio documentation](https://github.com/cheeriojs/cheerio#api) for information on the api.
```js
const schema = {
  links: ($, context) => {
    return $('a').map((i, el) => $(el).attr('href')).get()
  }
}
//=> {
//     "links": [
//       "https://my-domain.com/commits/2",
//       "https://my-domain.com/commits/1"
//     ]
//   }
```
**Array**
The `array` is usefull to retrieve lists. The first index is either a string or a schema object, and the second is the context. The context is required when a schema is provided to ensure all fields are grouped correctly.
```js
const schema = {
  list: ['li']
}
//=> {
//     "list": [
//       "changed something\n      John Doe",
//       "initial commit\n      John Doe"
//     ]
//   }
```
Sometimes that's enough but with our markup it doesn't look very good. Lets use a schema instead of a selector and we will use the `li` as the context to search in.
```js
const commitSchema = {
  message: '.message',
  author: '.author'
}
const schema = {
  list: [commitSchema, 'li']
}
//=> {
//     "list": [
//       {
//         "message": "changed something",
//         "author": "John Doe"
//       },
//       {
//         "message": "initial commit",
//         "author": "John Doe"
//       }
//     ]
//   }
```
License
----
MIT