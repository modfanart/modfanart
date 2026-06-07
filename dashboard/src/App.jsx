import { BrowserRouter } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import { Providers } from "./store/Providers";

import Router from "./router/Router";

import "./App.css";

function App() {
  return (
    <Providers>
      <AuthProvider>
        <BrowserRouter>
          <Router />
        </BrowserRouter>
      </AuthProvider>
    </Providers>
  );
}

export default App;