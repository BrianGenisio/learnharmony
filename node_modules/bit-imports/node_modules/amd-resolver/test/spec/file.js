define(["dist/amd-resolver"], function(Resolver) {
  var File = Resolver.File;

  describe("File Test Suite", function() {

    describe("when calling parseParts", function() {
      describe("with a simple file path", function() {
        var fileName = File.parseParts("/mortarjs.html");

        it("then the file name is `mortarjs.html`", function() {
          expect(fileName.name).to.equal("mortarjs.html");
        });

        it("then the file directory is `/`", function() {
          expect(fileName.directory).to.equal("/");
        });
      });

      describe("with a leading dot directory", function() {
        var fileName = File.parseParts("./mortarjs.html");

        it("then the file name is `mortarjs.html`", function() {
          expect(fileName.name).to.equal("mortarjs.html");
        });

        it("then the file directory is `./`", function() {
          expect(fileName.directory).to.equal("./");
        });
      });

      describe("with just a file", function() {
        var fileName = File.parseParts("mortarjs.html");

        it("then the file name is `mortarjs.html`", function() {
          expect(fileName.name).to.equal("mortarjs.html");
        });

        it("then the file directory is an empty string", function() {
          expect(fileName.directory).to.equal("");
        });
      });

      describe("with a leading dot file", function() {
        var fileName = File.parseParts(".mortarjs.html");
        it("then the file name is `.mortarjs.html`", function() {
          expect(fileName.name).to.equal(".mortarjs.html");
        });

        it("then the file directory is an empty string", function() {
          expect(fileName.directory).to.equal("");
        });
      });

      describe("with a deep path file", function() {
        var fileName = File.parseParts("/this/is/a/looong/path/to/the/file/mortarjs.html");
        it("then the file name is equal to `mortarjs.html`", function() {
          expect(fileName.name).to.equal("mortarjs.html");
        });

        it("then the file directory is `/this/is/a/looong/path/to/the/file/`", function() {
          expect(fileName.directory).to.equal("/this/is/a/looong/path/to/the/file/");
        });
      });

      describe("with a deep path and leading dot file", function() {
        var fileName = File.parseParts("/this/is/a/looong/path/to/the/file/.mortarjs.html");

        it("then the file name is equal to `.mortarjs.html`", function() {
          expect(fileName.name).to.equal(".mortarjs.html");
        });

        it("then the file directory is equal to `/this/is/a/looong/path/to/the/file/`", function() {
          expect(fileName.directory).to.equal("/this/is/a/looong/path/to/the/file/");
        });
      });
    });


    describe("when calling addExtension", function() {
      describe("when adding extension to file with existing extension", function() {
        it("then `test/file.html` is `test/file.html`", function() {
          var fileString = File.addExtension("test/file.html", "js");
          expect(fileString).to.equal("test/file.html");
        });

        it("then `test/file.ext1.html` is `test/file.ext1.html`", function() {
          var fileString = File.addExtension("test/file.ext1.html", "js");
          expect(fileString).to.equal("test/file.ext1.html");
        });

        it("then `test/.file.ext1.html` is `test/.file.ext1.html`", function() {
          var fileString = File.addExtension("test/.file.ext1.html", "js");
          expect(fileString).to.equal("test/.file.ext1.html");
        });
      });

      describe("when adding extension to file without existing extension", function() {
        it("then `test/file` is `test/file.js", function() {
          var fileString = File.addExtension("test/file", "js");
          expect(fileString).to.equal("test/file.js");
        });
      });
    });


    describe("when calling replaceExtension", function() {
      describe("when replacing extension in file path with existing extension", function() {
        it("then `test/file.html` is `test/file.js`", function() {
          var fileString = File.replaceExtension("test/file.html", "js");
          expect(fileString).to.equal("test/file.js");
        });

        it("then `test/file.ext1.html` is `test/file.ext1.js`", function() {
          var fileString = File.replaceExtension("test/file.ext1.html", "js");
          expect(fileString).to.equal("test/file.ext1.js");
        });

        it("then `test/.file.ext1.html` is `test/.file.ext1.js`", function() {
          var fileString = File.replaceExtension("test/.file.ext1.html", "js");
          expect(fileString).to.equal("test/.file.ext1.js");
        });

        it("then `test/.test/.file.ext1.html` is `test/.test/.file.ext1.js`", function() {
          var fileString = File.replaceExtension("test/.test/.file.ext1.html", "js");
          expect(fileString).to.equal("test/.test/.file.ext1.js");
        });
      });

      describe("when replacing extension in file paths without existing extension", function() {
        it("then `test/file` is `test/file.js", function() {
          var fileString = File.replaceExtension("test/file", "js");
          expect(fileString).to.equal("test/file.js");
        });

        it("then `test/.file` is `test/.file.js", function() {
          var fileString = File.replaceExtension("test/.file", "js");
          expect(fileString).to.equal("test/.file.js");
        });

        it("then `test/.test/.file` is `test/.test/.file`", function() {
          var fileString = File.replaceExtension("test/.test/.file", "js");
          expect(fileString).to.equal("test/.test/.file.js");
        });
      });
    });



    describe("when calling `new File`", function() {
      describe("using HTTP protocol", function() {
        describe("and a simple url", function() {
          describe("for `http://hoistedjs.com`", function() {
            var parsedURL = (new File("http://hoistedjs.com")).url;

            it("origin equals `http://hoistedjs.com`", function() {
              expect(parsedURL.origin).to.equal("http://hoistedjs.com");
            });

            it("href equals `http://hoistedjs.com`", function() {
              expect(parsedURL.href).to.equal("http://hoistedjs.com/");
            });

            it("protocol equals `http:`", function() {
              expect(parsedURL.protocol).to.equal("http:");
            });

            it("hostname equals `hoistedjs.com`", function() {
              expect(parsedURL.hostname).to.equal("hoistedjs.com");
            });

            it("pathname equals `/`", function() {
              expect(parsedURL.pathname).to.equal('/');
            });
          });

          describe("with a hash", function () {
            describe("for `http://hoistedjs.com#migration/topic/data`", function() {
              var parsedURL = (new File("http://hoistedjs.com#migration/topic/data")).url;

              it("origin equals `http://hoistedjs.com`", function() {
                expect(parsedURL.origin).to.equal("http://hoistedjs.com");
              });

              it("href equals `http://hoistedjs.com/#migration/topic/data`", function() {
                expect(parsedURL.href).to.equal("http://hoistedjs.com/#migration/topic/data");
              });

              it("protocol equals `http:`", function() {
                expect(parsedURL.protocol).to.equal("http:");
              });

              it("hostname equals `hoistedjs.com`", function() {
                expect(parsedURL.hostname).to.equal("hoistedjs.com");
              });

              it("pathname equals `/`", function() {
                expect(parsedURL.pathname).to.equal('/');
              });

              it("hash equals `#migration/topic/data`", function() {
                expect(parsedURL.hash).to.equal("#migration/topic/data");
              });
            });
          });

          describe("with a search string", function() {
            describe("for `http://hoistedjs.com?topic=data`", function() {
              var parsedURL = (new File("http://hoistedjs.com?topic=data")).url;

              it("origin equals `http://hoistedjs.com`", function() {
                expect(parsedURL.origin).to.equal("http://hoistedjs.com");
              });

              it("href equals `http://hoistedjs.com/?topic=data`", function() {
                expect(parsedURL.href).to.equal("http://hoistedjs.com/?topic=data");
              });

              it("protocol equals `http:`", function() {
                expect(parsedURL.protocol).to.equal("http:");
              });

              it("hostname equals `hoistedjs.com`", function() {
                expect(parsedURL.hostname).to.equal("hoistedjs.com");
              });

              it("pathname equals `/`", function() {
                expect(parsedURL.pathname).to.equal('/');
              });

              it("search equals `?topic=data`", function() {
                expect(parsedURL.search).to.equal("?topic=data");
              });
            });

            describe("and a hash", function() {
              describe("for `http://hoistedjs.com?topic=data#migration/path`", function() {
                var parsedURL = (new File("http://hoistedjs.com?topic=data#migration/path")).url;

                it("origin equals `http://hoistedjs.com`", function() {
                  expect(parsedURL.origin).to.equal("http://hoistedjs.com");
                });

                it("origin equals `http://hoistedjs.com/?topic=data#migration/path`", function() {
                  expect(parsedURL.href).to.equal("http://hoistedjs.com/?topic=data#migration/path");
                });

                it("protocol equals `http:`", function() {
                  expect(parsedURL.protocol).to.equal("http:");
                });

                it("hostname equals `hoistedjs.com`", function() {
                  expect(parsedURL.hostname).to.equal("hoistedjs.com");
                });

                it("pathname should be `/`", function() {
                  expect(parsedURL.pathname).to.equal('/');
                });

                it("search equals `?topic=data`", function() {
                  expect(parsedURL.search).to.equal("?topic=data");
                });

                it("hash equals `#migration/path`", function() {
                  expect(parsedURL.hash).to.equal("#migration/path");
                });
              });

              describe("and an empty path", function() {
                describe("for `http://hoistedjs.com/?topic=data#migration/path`", function() {
                  var parsedURL = (new File("http://hoistedjs.com/?topic=data#migration/path")).url;

                  it("origin equals `http://hoistedjs.com`", function() {
                    expect(parsedURL.origin).to.equal("http://hoistedjs.com");
                  });

                  it("href equals `http://hoistedjs.com/?topic=data#migration/path`", function() {
                    expect(parsedURL.href).to.equal("http://hoistedjs.com/?topic=data#migration/path");
                  });

                  it("protocol equals `http:`", function() {
                    expect(parsedURL.protocol).to.equal("http:");
                  });

                  it("hostname equals `hoistedjs.com`", function() {
                    expect(parsedURL.hostname).to.equal("hoistedjs.com");
                  });

                  it("pathname equals `/`", function() {
                    expect(parsedURL.pathname).to.equal("/");
                  });

                  it("search equals `?topic=data`", function() {
                    expect(parsedURL.search).to.equal("?topic=data");
                  });

                  it("hash equals `#migration/path`", function() {
                    expect(parsedURL.hash).to.equal("#migration/path");
                  });
                });
              });

              describe("and a simple path", function() {
                describe("for `http://hoistedjs.com/moretesting?topic=data#migration/path`", function() {
                  var parsedURL = (new File("http://hoistedjs.com/moretesting?topic=data#migration/path")).url;

                  it("origin equals `http://hoistedjs.com`", function() {
                    expect(parsedURL.origin).to.equal("http://hoistedjs.com");
                  });

                  it("href equals `http://hoistedjs.com/moretesting?topic=data#migration/path`", function() {
                    expect(parsedURL.href).to.equal("http://hoistedjs.com/moretesting?topic=data#migration/path");
                  });

                  it("protocol equals `http:`", function() {
                    expect(parsedURL.protocol).to.equal("http:");
                  });

                  it("hostname equals `hoistedjs.com`", function() {
                    expect(parsedURL.hostname).to.equal("hoistedjs.com");
                  });

                  it("pathname equals `/moretesting/`", function() {
                    expect(parsedURL.pathname).to.equal("/moretesting");
                  });

                  it("search equals `?topic=data`", function() {
                    expect(parsedURL.search).to.equal("?topic=data");
                  });

                  it("hash equals `#migration/path`", function() {
                    expect(parsedURL.hash).to.equal("#migration/path");
                  });
                });

                describe("with a port", function() {
                  describe("for `http://hoistedjs.com:599/moretesting?topic=data#migration/path`", function() {
                    var parsedURL = (new File("http://hoistedjs.com:599/moretesting?topic=data#migration/path")).url;

                    it("origin equals `http://hoistedjs.com:599`", function() {
                      expect(parsedURL.origin).to.equal("http://hoistedjs.com:599");
                    });

                    it("href equals `http://hoistedjs.com:599/moretesting?topic=data#migration/path`", function() {
                      expect(parsedURL.href).to.equal("http://hoistedjs.com:599/moretesting?topic=data#migration/path");
                    });

                    it("protocol equals `http:`", function() {
                      expect(parsedURL.protocol).to.equal("http:");
                    });

                    it("hostname equals `hoistedjs.com`", function() {
                      expect(parsedURL.hostname).to.equal("hoistedjs.com");
                    });

                    it("port equals `599`", function() {
                      expect(parsedURL.port).to.equal('599');
                    });

                    it("pathname equals `/moretesting`", function() {
                      expect(parsedURL.pathname).to.equal("/moretesting");
                    });

                    it("search equals `?topic=data`", function() {
                      expect(parsedURL.search).to.equal("?topic=data");
                    });

                    it("hash equals `#migration/path`", function() {
                      expect(parsedURL.hash).to.equal("#migration/path");
                    });
                  });
                });
              });
            });
          });
        });
      });

    });
  });
});
