import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
// Force rebuild to install react-quill dependencies

createRoot(document.getElementById("root")!).render(<App />);
