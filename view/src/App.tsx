import React from "react";
import { PredictionProvider } from "./contexts/predictions";
import { Container } from "./components/container/container.component";

function App() {
  return (
    <PredictionProvider>
      <Container />
    </PredictionProvider>
  );
}

export default App;
