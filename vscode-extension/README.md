# Gemini Code Showcase

This Visual Studio Code extension helps developers manage and utilize "skills" for AI-assisted workflows, particularly with Google's Gemini models. It suggests relevant skills based on the currently opened file, allows you to browse and apply them, and even send prompts directly to a Gemini API endpoint.

## Features

*   **Context-Aware Skill Suggestions**: Automatically suggests skills when you open a file that matches predefined rules (e.g., by file extension or path).
*   **Skill Browser**: Quickly list and view all available skills in your workspace.
*   **Apply & Copy**: Open a skill's content in a new editor tab and automatically copy it to your clipboard, making it easy to paste into an AI chat interface.
*   **Direct API Integration (Experimental)**: Send a selected skill or a custom prompt directly to a Gemini-compatible API endpoint and view the response within VS Code.

## How It Works

The extension operates based on a `.gemini` directory in the root of your workspace. You must create this directory and populate it with your own skills and configuration.

### Directory Structure

```
.
├── .gemini/
│   ├── config/
│   │   └── skill-rules.json  // Defines rules for suggesting skills
│   └── skills/
│       ├── my-first-skill/
│       │   └── SKILL.md        // The content of your first skill
│       └── another-skill/
│           └── SKILL.md        // The content of another skill
└── your-project-files/
    └── ...
```

### Skills

A "skill" is simply a directory inside `.gemini/skills/` containing a `SKILL.md` file. This markdown file holds the prompt, instructions, or documentation you want to use.

**Example: `.gemini/skills/react-component-test/SKILL.md`**

```markdown
You are an expert in testing React components using Jest and React Testing Library.

Given the following React component, please write a comprehensive suite of unit tests. The tests should cover rendering, user interactions, and edge cases.

[Paste Component Code Here]
```

### Skill Rules

The `.gemini/config/skill-rules.json` file tells the extension when to suggest a skill. It contains an array of rules that match files based on their extension or path.

**Example: `.gemini/config/skill-rules.json`**

```json
{
  "rules": [
    {
      "match": {
        "fileExtensions": [".js", ".jsx", ".ts", ".tsx"]
      },
      "applySkills": ["react-component-test"]
    },
    {
      "match": {
        "pathContains": ["/server/api/"]
      },
      "applySkills": ["backend-api-docs"]
    }
  ]
}
```

In this example:
*   Opening any `.js`, `.jsx`, `.ts`, or `.tsx` file will suggest the `react-component-test` skill.
*   Opening any file within a path that includes `/server/api/` will suggest the `backend-api-docs` skill.

## Commands

You can access the following commands from the Command Palette (`Ctrl+Shift+P` or `Cmd+Shift+P`):

*   **`Gemini: List Skills`**: Displays a quick-pick list of all available skills. Selecting one opens its content in a new tab and copies it to the clipboard.
*   **`Gemini: Apply Skill`**: An alias for `Gemini: List Skills`.
*   **`Gemini: Send Prompt to Model (requires API key)`**: Allows you to select a skill or write a custom prompt to send to a Gemini API.
    *   **Note**: This is an experimental feature. You will be prompted to enter your API endpoint, API key, and model name. This information is held in-memory only and is not stored.

## Getting Started

1.  **Install** the extension.
2.  **Create** the `.gemini` directory structure in your project's root.
3.  **Define** your first skill by creating a subdirectory and a `SKILL.md` file inside `.gemini/skills/`.
4.  **(Optional)** Create a `skill-rules.json` file in `.gemini/config/` to enable automatic skill suggestions.
5.  Open the Command Palette and run **`Gemini: List Skills`** to see your skills in action.
