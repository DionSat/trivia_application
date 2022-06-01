import React from "react";
import { Toast } from "react-bootstrap";

export default function Toasts({ message, show, setShow }) {
  return (
    <Toast
      bg="light"
      onClose={() => setShow(false)}
      show={show}
      delay={5000}
      autohide
    >
      <Toast.Header>
        <strong className="me-auto">Trivia</strong>
      </Toast.Header>
      <Toast.Body>{message}</Toast.Body>
    </Toast>
  );
}