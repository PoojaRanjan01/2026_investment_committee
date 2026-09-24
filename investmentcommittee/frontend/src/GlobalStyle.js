import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }
  html, body, #root {
    margin: 0;
    min-height: 100svh;
  }
  body {
    background: ${({ theme }) => theme.colors.bg};
    color: ${({ theme }) => theme.colors.text};
    font-family: ${({ theme }) => theme.fonts.sans};
    line-height: 1.55;
    -webkit-font-smoothing: antialiased;
  }
  h1, h2, h3 {
    font-family: ${({ theme }) => theme.fonts.serif};
    font-weight: 600;
    margin: 0;
  }
  a { color: inherit; }
  input, select, button, textarea { font-family: inherit; }
`;
