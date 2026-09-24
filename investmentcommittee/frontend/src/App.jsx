import { ThemeProvider } from "styled-components";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { GlobalStyle } from "./GlobalStyle";
import { useUndervaluedTheme } from "./useUndervaluedTheme";
import { Sidebar } from "./components/Sidebar";
import { Shell, Main } from "./appPrimitives";
import AnalyzePage from "./pages/AnalyzePage";
import SettingsPage from "./pages/SettingsPage";

export default function App() {
  const { theme, mode, setMode } = useUndervaluedTheme();

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <BrowserRouter>
        <Shell>
          <Sidebar mode={mode} onModeChange={setMode} />
          <Main>
            <Routes>
              <Route path="/" element={<AnalyzePage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Routes>
          </Main>
        </Shell>
      </BrowserRouter>
    </ThemeProvider>
  );
}
