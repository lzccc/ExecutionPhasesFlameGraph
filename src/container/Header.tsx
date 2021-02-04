import { ReactComponent } from "*.svg";
import React from "react";
import Navbar from "react-bootstrap/Navbar";
import Nav from "react-bootstrap/Nav";
import Form from "react-bootstrap/Form";
import FormControl from "react-bootstrap/FormControl";
import "bootstrap/dist/css/bootstrap.min.css";
import spiderLogo from "../resources/spiderLab.png";
import "./Header.css";

class Header extends React.Component {
  render() {
    return (
      <Navbar
        bg="light"
        variant="light"
        style={{
          paddingLeft: "10%",
          paddingRight: "10%",
        }}
      >
        <Navbar.Brand
          href="#home"
          className="NavbarBrand"
          style={{ color: "#7d1313" }}
        >
          <img src={spiderLogo} width={50} style={{ marginRight: 10 }}></img>
          Spider Lab
        </Navbar.Brand>
        <Navbar.Collapse className="justify-content-end">
          <Nav>
            <Nav.Link href="#home">Home</Nav.Link>
            <Nav.Link href="#about">About</Nav.Link>
            <Nav.Link href="#references">References</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Navbar>
    );
  }
}

export default Header;
