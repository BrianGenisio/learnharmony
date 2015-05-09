promjax
=======

Promise based Ajax provider - xmlhttprequest and promises.

> promjax *only* executes asynchronous requests and does not provide a way to configure your requests to run *synchronously*.


### API

#### promjax(options : object)

Method that will create an `xmlhttprequest` instance to make an Ajax request.  Returns [promise](https://github.com/MiguelCastillo/spromise)

Most of the supported options in promjax are just simple pass through right into the underlying `xmlhttprequest` object.  So if there are specific questions about the options documented here, please feel free to refer to [the doc](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest).  Or go ahead an log an issue and I will be happy to help.

- **`options`** *{object | string}* - Configuration for the Ajax call.  If `options` is a string, then options is internally coerced to the `url` of the request.
  - **`url`** *{string}* - end point where the ajax request is going to.
  - **`method`** *{string}* - HTTP verb for the request. Default is `GET`.  There are really no restrictions imposed by `promjax` on the verbs, so whatever is passed in will be used; only limited to what the underlying `xmlhttprequest` implementation supports.
  - **`data`** *{object}* - Data to be sent along with the request.  No restrictions on this.  Whatever the underlying `xmlhttprequest` supports is what you are limited to.
  - **`headers`** *{object}* - collection of key/value pair of header name and header value.
  - **`user`** *{string}* - value as defined by W3C. [MDN link](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
  - **`password`** *{string}* - value as defined by W3C. [MDN link](https://developer.mozilla.org/en-US/docs/Web/API/XMLHttpRequest)
  - **`responseType`** *{string}* - data type for the response.  Currently, only `json` is supported.  If anything else other than `json` is provided, you will just get the raw `responseText`.  But you can define a `transform` method if you want to pre-process the response before the deferred promise is resolved.
  - **`transform`** *{function}* - method that is called with the responseText when the Ajax request has completed. The method is called to give you a chance to process your data right before the deferred promise is resolved, which is really useful when converting responses like JSON before the reponse is handed back to the calling code.


##### Examples

1- Ajax request with just a string [from unit tests]:

``` javascript
ajax("SpecRunner.html")
  .then(function(response, request) {
    console.log(response);
  });
```

2- Ajax request with an `options` object specifying a `reponseType` [from unit tests]:

``` javascript
ajax({
  url: "json/artists.json",
  responseType: "json"
})
.then(function(response, request) {
  console.log(response);
});
```

3- Ajax request with an `options` object specifying a `tranform` method [from unit tests]:

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
