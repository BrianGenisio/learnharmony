promjax
=======

Overly simplified Promise based Ajax provider - xmlhttprequest and promises.  Most of the supported options in promjax are just simple pass through right into the underlying `xmlhttprequest` object.  So if there are specific questions about the options documented here, please feel free to refer to [the doc](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest).  Or go ahead an log an issue and I will be happy to help.


### API

#### promjax(options : object)

Method that will create an `xmlhttprequest` instance to make an Ajax request.

@param {object | string} options - Configuration for the Ajax call.  If `options` is a string, then options is internally coerced to the `url` of the request.

- @property {string} `url` - end point where the ajax request is going to.
- @property {string} `method` - HTTP verb for the request. Default is `GET`.  There are really no restrictions imposed by `promjax` on the verbs, so whatever is passed in will be used; only limited to what the underlying `xmlhttprequest` implementation supports.
- @property {object} `data` - Data to be sent along with the request.  No restrictions on this.  Whatever the underlying `xmlhttprequest` supports is what you are limited to.
- @property {boolean} `async` - flag to make the request synchronous.  It defaults to true.
- @property {object} `headers` - collection of key/value pair of header name and header value.
- @property {string} `user` - value as defined by W3C. [MDN link](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
- @property {string} `password` - value as defined by W3C. [MDN link](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
- @property {string} `responseType` - data type for the response.  Currently, only `json` is supported.  If anything else other than `json` is provided, you will just get the raw `responseText`.  But you can define a `transform` method if you would to pre-process the response before the deferred promise is resolved.
- @property {function} `transform` - method that is called with the responseText when the Ajax request has completed. The method is called right before the deferred promise is resolved to give you a chance to process your data.  This is really useful when converting response like JSON before the reponse is handed back in the resolved deferred promise.

@returns {Promise}


##### example

1. Ajax request with just a string [from unit tests]:

``` javascript
ajax("SpecRunner.html")
  .then(function(response, request) {
    console.log(response);
  });
```

2. Ajax request with an `options` object specifying a `reponseType` [from unit tests]:

``` javascript
ajax({
  url: "json/artists.json",
  responseType: "json"
})
.then(function(response, request) {
  console.log(response);
});
```

3. Ajax request with an `options` object specifying a `tranform` method [from unit tests]:

``` javascript
ajax({
  url: "json/artists.json",
  transform: JSON.parse
})
.then(function(response, request) {
  console.log(response);
});
```

### Install

#### From npm

```
npm install promjax
```
