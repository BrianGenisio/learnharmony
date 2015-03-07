System.register("js/register1", ["js/register2"], function(register2) {
  return {
    hello: "from module register1",
    register2: register2
  };
});
