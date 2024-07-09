import "./App.css";
import RoutesPage from "./pages/Routes";
import "froala-editor/css/froala_editor.pkgd.min.css";
import "froala-editor/css/froala_style.min.css";
import "froala-editor/js/plugins.pkgd.min.js";
import "react-quill/dist/quill.snow.css";
function App() {
  return (
    <div className="App">
      <RoutesPage />
    </div>
  );
}

export default App;
