# Gemini Assistant (VSCode Extension)

## Usage
1. Copy the `vscode-extension` folder locally.
2. Run `npm install`.
3. Run `npm run compile`.
4. Use VS Code's Run Extension or `vsce package` to build/install.

## Gemini API notes
- The extension includes a simple `Send Prompt to Model` command that asks for:
  - API endpoint (replace with the correct Google Generative AI endpoint)
  - API key (entered at runtime)
  - Model name
- This design intentionally avoids storing secrets on disk; the key is used in-memory only.
