const fetch = require('isomorphic-fetch')
const cheerio = require('cheerio')

const optionsDefault = {
  js: false
}

/**
 * Fetch url body
 * @param {String} url
 * @return {Promise}
 */
function get (url) {
  return fetch(url).then(response => response.text())
}

/**
 * Parses a schema
 * @param {Object} schema The schema to parse
 * @param {Object|String} context Optional context
 * @return {Object} Object matching the schema
 */
function parse (schema, $, context = null) {
  return Object.entries(schema).reduce((obj, [key, value]) => {
    let type = typeof value
    if (Array.isArray(value)) type = 'array'
    let result = null

    switch (type) {
      case 'string':
        const [firstMatch] = getCheerioText(value, $, context)
        result = firstMatch || null
        break;

      case 'array':
        const [ listSchema, listContext ] = value

        if (typeof listSchema === 'string') {
          result = getCheerioText(listSchema, $, context)
        } else {
          const matches = $(listContext, context)

          result = matches.map((_, elem) => {
            return parse(listSchema, $, elem)
          }).get()
        }
        break;

      case 'function':
        result = value($, context)
        break;

      default:
        result = parse(value, $, context)
        break;
    }

    obj[key] = result
    return obj
  }, {})
}

/**
 * Helper function to extract text from all matches
 * @param {String} selector
 * @param {Object} $ Cheerio object
 * @param {Object|string} context Cheerio context
 * @return {Array} Array containing text from matches
 */
function getCheerioText (selector, $, context = null) {
  // test if trim breaks without match
  return $(selector, context).map((_, elem) => $(elem).text().trim()).get()
}

/**
 * Create a location object from href
 * @param {String} href
 * @param {Object} location Optional location object to replace missing pieces of the url
 * @return {Object} Location object
 */
function getLocation (href, location = null) {
  return {
    href
  }
}

class Scrapise {
  constructor (url, schema, options = optionsDefault) {
    this.options = options
    this.location = getLocation(url)

    return get(url).then(body => {
        const $ = cheerio.load(body, { decodeEntities: true })

        return parse(schema, $)
      })
  }
}

module.exports = (...args) => new Scrapise(...args)
