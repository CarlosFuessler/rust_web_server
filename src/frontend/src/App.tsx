import React, { useEffect, useState } from "react";
import logo from "./logo.svg";
import "./App.css";

// TypeScript Interfaces für API Daten
interface ResponseData {
  message: string;
}

interface InputData {
  name: string;
  age: number;
}

function App() {
  // useEffect muss INNERHALB der Komponente stehen
  return <div>Hello World</div>;
}

export default App;
