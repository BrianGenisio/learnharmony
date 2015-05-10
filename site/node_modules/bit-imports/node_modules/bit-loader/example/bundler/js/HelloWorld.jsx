import React from "react";
import Header from "./Header.jsx";
import Body from "./Body.jsx";

class HelloWorld extends React.Component {
  constructor() {
    super();
  }

  render() {
    return (
      <div>
        <Header/>
        <Body/>
        <div>Hello World!</div>
      </div>
    );
  }
}

export default HelloWorld;
