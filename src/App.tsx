import React from "react";
import logo from "./logo.svg";
import "./App.css";
import Button from "react-bootstrap/Button";
import Alert from "react-bootstrap/Alert";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import "bootstrap/dist/css/bootstrap.min.css";
import Header from "./container/Header";
import FlameGraph from "./container/flameGraph/FlameGraph";

function App() {
  return (
    <div className="App">
      <Header></Header>
      <FlameGraph />
    </div>
  );
}

export default App;
