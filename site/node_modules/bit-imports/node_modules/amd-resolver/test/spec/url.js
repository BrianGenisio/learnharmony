define(["dist/amd-resolver"], function(Resolver) {
  var URL = Resolver.URL;

  describe("URL Test Suite", function() {

    describe("When creating a URL with ''", function() {
      var url = new URL('');

      it("then `hash` is an empty string", function() {
        expect(url.hash).to.equal('');
      });

      it("then `host` is an empty string", function() {
        expect(url.host).to.equal('');
      });

      it("then `hostname` is an empty string", function() {
        expect(url.hostname).to.equal('');
      });

      it("then `href` is an empty string", function() {
        expect(url.href).to.equal('');
      });

      it("then `origin` is an empty string", function() {
        expect(url.origin).to.equal('');
      });

      it("then `password` is an empty string", function() {
        expect(url.password).to.equal('');
      });

      it("then `pathname` is an empty string", function() {
        expect(url.pathname).to.equal('');
      });

      it("then `port` is an empty string", function() {
        expect(url.port).to.equal('');
      });

      it("then `protocol` is an empty string", function() {
        expect(url.protocol).to.equal('');
      });

      it("then `search` is an empty string", function() {
        expect(url.search).to.equal('');
      });

      it("then `username` is an empty string", function() {
        expect(url.username).to.equal('');
      });
    });

    describe("When creating a URL with `https://developer.mozilla.org`", function() {
      var url = new URL("https://developer.mozilla.org");

      it("then `hash` is an empty string", function() {
        expect(url.hash).to.equal('');
      });

      it("then `host` is `developer.mozilla.org`", function() {
        expect(url.host).to.equal("developer.mozilla.org");
      });

      it("then `hostname` is `developer.mozilla.org`", function() {
        expect(url.hostname).to.equal("developer.mozilla.org");
      });

      it("then `href` is `https://developer.mozilla.org/`", function() {
        expect(url.href).to.equal("https://developer.mozilla.org/");
      });

      it("then `origin` is `https://developer.mozilla.org`", function() {
        expect(url.origin).to.equal("https://developer.mozilla.org");
      });

      it("then `password` is an empty string", function() {
        expect(url.password).to.equal('');
      });

      it("then `pathname` is `/`", function() {
        expect(url.pathname).to.equal("/");
      });

      it("then `port` is an empty string", function() {
        expect(url.port).to.equal('');
      });

      it("then `protocol` is `https:`", function() {
        expect(url.protocol).to.equal("https:");
      });

      it("then `search` is an empty string", function() {
        expect(url.search).to.equal('');
      });

      it("then `username` is an empty string", function() {
        expect(url.username).to.equal('');
      });
    });


    describe("When creating a URL with `/` and base `https://developer.mozilla.org`", function() {
      var url = new URL("/", "https://developer.mozilla.org");

      it("then `hash` is an empty string", function() {
        expect(url.hash).to.equal('');
      });

      it("then `host` is `developer.mozilla.org`", function() {
        expect(url.host).to.equal("developer.mozilla.org");
      });

      it("then `hostname` is `developer.mozilla.org`", function() {
        expect(url.hostname).to.equal("developer.mozilla.org");
      });

      it("then `href` is `https://developer.mozilla.org/`", function() {
        expect(url.href).to.equal("https://developer.mozilla.org/");
      });

      it("then `origin` is `https://developer.mozilla.org`", function() {
        expect(url.origin).to.equal("https://developer.mozilla.org");
      });

      it("then `password` is an empty string", function() {
        expect(url.password).to.equal('');
      });

      it("then `pathname` is `/`", function() {
        expect(url.pathname).to.equal("/");
      });

      it("then `port` is an empty string", function() {
        expect(url.port).to.equal('');
      });

      it("then `protocol` is `https:`", function() {
        expect(url.protocol).to.equal("https:");
      });

      it("then `search` is an empty string", function() {
        expect(url.search).to.equal('');
      });

      it("then `username` is an empty string", function() {
        expect(url.username).to.equal('');
      });
    });


    describe("When creating a URL with `en-US/docs` and base `https://developer.mozilla.org`", function() {
      var url = new URL("en-US/docs", "https://developer.mozilla.org");

      it("then `hash` is an empty string", function() {
        expect(url.hash).to.equal('');
      });

      it("then `host` is `developer.mozilla.org`", function() {
        expect(url.host).to.equal("developer.mozilla.org");
      });

      it("then `hostname` is `developer.mozilla.org`", function() {
        expect(url.hostname).to.equal("developer.mozilla.org");
      });

      it("then `href` is `https://developer.mozilla.org/en-US/docs`", function() {
        expect(url.href).to.equal("https://developer.mozilla.org/en-US/docs");
      });

      it("then `origin` is `https://developer.mozilla.org`", function() {
        expect(url.origin).to.equal("https://developer.mozilla.org");
      });

      it("then `password` is an empty string", function() {
        expect(url.password).to.equal('');
      });

      it("then `pathname` is `/en-US/docs`", function() {
        expect(url.pathname).to.equal("/en-US/docs");
      });

      it("then `port` is an empty string", function() {
        expect(url.port).to.equal('');
      });

      it("then `protocol` is `https:`", function() {
        expect(url.protocol).to.equal("https:");
      });

      it("then `search` is an empty string", function() {
        expect(url.search).to.equal('');
      });

      it("then `username` is an empty string", function() {
        expect(url.username).to.equal('');
      });
    });


    describe("When creating a URL with `/en-US/docs` and base `https://developer.mozilla.org`", function() {
      var url = new URL("/en-US/docs", "https://developer.mozilla.org");

      it("then `hash` is an empty string", function() {
        expect(url.hash).to.equal('');
      });

      it("then `host` is `developer.mozilla.org`", function() {
        expect(url.host).to.equal("developer.mozilla.org");
      });

      it("then `hostname` is `developer.mozilla.org`", function() {
        expect(url.hostname).to.equal("developer.mozilla.org");
      });

      it("then `href` is `https://developer.mozilla.org/en-US/docs`", function() {
        expect(url.href).to.equal("https://developer.mozilla.org/en-US/docs");
      });

      it("then `origin` is `https://developer.mozilla.org`", function() {
        expect(url.origin).to.equal("https://developer.mozilla.org");
      });

      it("then `password` is an empty string", function() {
        expect(url.password).to.equal('');
      });

      it("then `pathname` is `/en-US/docs`", function() {
        expect(url.pathname).to.equal("/en-US/docs");
      });

      it("then `port` is an empty string", function() {
        expect(url.port).to.equal('');
      });

      it("then `protocol` is `https:`", function() {
        expect(url.protocol).to.equal("https:");
      });

      it("then `search` is an empty string", function() {
        expect(url.search).to.equal('');
      });

      it("then `username` is an empty string", function() {
        expect(url.username).to.equal('');
      });
    });
  });


  describe("When calling resolve", function() {
    describe("with `../base/path` and baseUrl `http://localhost/some/path/`", function() {
      it("then resolve returns `http://localhost/some/base/path`", function() {
        expect(URL.parser.resolve("http://localhost/some/path/", "../base/path")).to.equal("http://localhost/some/base/path");
      });
    });

    describe("with `../base/path` and baseUrl `http://localhost/some/path`", function() {
      it("then resolve returns `http://localhost/base/path`", function() {
        expect(URL.parser.resolve("http://localhost/some/path", "../base/path")).to.equal("http://localhost/base/path");
      });
    });
  });

});
