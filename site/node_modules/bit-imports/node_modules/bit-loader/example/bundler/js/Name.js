import React from "react";
import HelloWorld from "./HelloWorld.jsx";

class Name {
  constructor(name) {
    this._name = name;
    this._helloWorld = React.render(<HelloWorld/>, document.body);
  }

  name() {
    return this._name;
  }
}

export default Name;
