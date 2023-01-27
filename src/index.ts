import "./styles/index.css";
import App from "./classes/App"
import DeckScene from "./classes/DeckScene"

// Get the root node to append our application to
const appRoot = document.getElementById("appRoot");

// Create the application
const app = new App(appRoot);

// Add the scenes
app.addScene(new DeckScene());

