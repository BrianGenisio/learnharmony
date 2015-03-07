System.register("test/js/register", ["test/js/deep0", "test/js/deep1", "test/js/deep2"], function(sayhi, sayhi6, sayhidefine) {

  console.log(sayhi, sayhi6, sayhidefine);

  describe("System.register - Say Hi Test suite", function() {
    it("System sayhi-6", function() {
      expect(sayhi6).to.equal("Say Hi 6");
    });

    it("System sayhi-cjs", function() {
      expect(sayhi).to.equal("Say Hi");
    });

    it("System sayhi-define", function() {
      expect(sayhidefine).to.equal("Say Hi Define");
    });
  });
});
