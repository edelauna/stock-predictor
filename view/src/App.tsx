import React from "react";
import { PredictionProvider } from "./contexts/predictions";
import { Container } from "./components/container/container.component";
import { Footer } from "./components/footer/footer.component";

function App() {
  return (
    <PredictionProvider>
      <Container />
      <Footer />
    </PredictionProvider>
  );
}

export default App;
