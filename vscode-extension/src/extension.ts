import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

function loadRules(root: string) {
  try {
    const p = path.join(root, '.gemini', 'config', 'skill-rules.json');
    if (!fs.existsSync(p)) return [];
    const raw = fs.readFileSync(p, 'utf8');
    return JSON.parse(raw).rules || [];
  } catch (e) {
    console.error('loadRules error', e);
    return [];
  }
}

function matchRules(filePath: string, rules: any[]) {
  const ext = path.extname(filePath);
  const normalized = filePath.replace(/\\/g, '/');
  return rules.filter(rule => {
    const matchExt = rule.match?.fileExtensions?.includes(ext);
    const matchPath = rule.match?.pathContains?.some((seg: string) => normalized.includes(seg));
    return matchExt || matchPath;
  }).map(r => r.applySkills).flat();
}

function loadSkillContent(root: string, skillId: string) {
  const skillPath = path.join(root, 'skills', skillId, 'SKILL.md');
  if (!fs.existsSync(skillPath)) return null;
  return fs.readFileSync(skillPath, 'utf8');
}

// Send prompt to Gemini via HTTP API (placeholder).
// NOTE: To actually call Gemini's API you must provide credentials and possibly use
// Google's Generative AI API endpoint. This function demonstrates how to call a
// generic HTTP endpoint from the extension. Replace `API_ENDPOINT` and `API_KEY`.
async function sendPromptToGemini(apiEndpoint: string, apiKey: string, model: string, prompt: string) {
  const body = {
    model,
    prompt
  };
  const res = await fetch(apiEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`API response ${res.status}: ${text}`);
  }
  return await res.json();
}

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage('Gemini Assistant is activating!');
  console.log('Gemini Assistant active');

  const workspaceRoot = vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
  const rules = workspaceRoot ? loadRules(workspaceRoot) : [];

  // Listen to file open events
  if (workspaceRoot) {
    vscode.workspace.onDidOpenTextDocument(doc => {
      const filePath = doc.fileName;
      const matchedSkills = matchRules(filePath, rules);
      if (matchedSkills.length) {
        vscode.window.showInformationMessage(`Suggested skills: ${matchedSkills.join(', ')}`, 'Show').then(sel => {
          if (sel === 'Show') {
            vscode.commands.executeCommand('gemini.listSkills');
          }
        });
      }
    });
  }

  // Command: list skills
  const listCmd = vscode.commands.registerCommand('gemini.listSkills', async () => {
    if (!workspaceRoot) return vscode.window.showErrorMessage('Open a workspace to use Gemini Assistant.');
    const skillsDir = path.join(workspaceRoot, 'skills');
    if (!fs.existsSync(skillsDir)) return vscode.window.showErrorMessage('No skills directory found.');
    const allSkills = fs.readdirSync(skillsDir).filter(f => fs.lstatSync(path.join(skillsDir, f)).isDirectory());
    const pick = await vscode.window.showQuickPick(allSkills, { placeHolder: 'Choose a skill to apply' });
    if (!pick) return;
    const content = loadSkillContent(workspaceRoot, pick);
    if (!content) return vscode.window.showErrorMessage('Skill content not found.');

    // Open new readonly editor with skill content
    const doc = await vscode.workspace.openTextDocument({ content, language: 'markdown' });
    await vscode.window.showTextDocument(doc, { preview: false });

    // Copy to clipboard to ease pasting into Gemini UI
    await vscode.env.clipboard.writeText(content);
    vscode.window.showInformationMessage('Skill content opened and copied to clipboard. Paste into your Gemini/Google AI chat.');
  });

  // Command: apply skill (same as pick + open)
  const applyCmd = vscode.commands.registerCommand('gemini.applySkill', async () => {
    vscode.commands.executeCommand('gemini.listSkills');
  });

  // Command: send to model (requires user to input API endpoint & key)
  const sendCmd = vscode.commands.registerCommand('gemini.sendToModel', async () => {
    if (!workspaceRoot) return vscode.window.showErrorMessage('Open a workspace to use Gemini Assistant.');

    // Let user pick a skill or enter custom prompt
    const skillsDir = path.join(workspaceRoot, 'skills');
    const allSkills = fs.existsSync(skillsDir) ? fs.readdirSync(skillsDir).filter(f => fs.lstatSync(path.join(skillsDir, f)).isDirectory()) : [];
    const pick = await vscode.window.showQuickPick([...allSkills, 'CUSTOM_PROMPT'], { placeHolder: 'Choose a skill or CUSTOM_PROMPT' });
    if (!pick) return;

    let prompt = '';
    if (pick === 'CUSTOM_PROMPT') {
      const input = await vscode.window.showInputBox({ prompt: 'Enter prompt to send to Gemini' });
      if (!input) return;
      prompt = input;
    } else {
      const content = loadSkillContent(workspaceRoot, pick);
      if (!content) return vscode.window.showErrorMessage('Skill content not found.');
      prompt = content;
    }

    const apiEndpoint = await vscode.window.showInputBox({ prompt: 'Enter Gemini API endpoint (e.g. https://api.generativeai.googleapis.com/v1/models/MODEL:generateText)' });
    if (!apiEndpoint) return;
    const apiKey = await vscode.window.showInputBox({ prompt: 'Enter API key (kept in-memory only)', password: true });
    if (!apiKey) return;
    const model = await vscode.window.showInputBox({ prompt: 'Enter model name', value: 'gemini-2.0-pro-exp' });
    if (!model) return;

    vscode.window.withProgress({ location: vscode.ProgressLocation.Notification, title: 'Sending to Gemini...' }, async (p) => {
      try {
        const result = await sendPromptToGemini(apiEndpoint, apiKey, model, prompt);
        // Show result in a new editor
        const doc = await vscode.workspace.openTextDocument({ content: JSON.stringify(result, null, 2), language: 'json' });
        await vscode.window.showTextDocument(doc, { preview: false });
      } catch (e: any) {
        vscode.window.showErrorMessage('Error sending to Gemini: ' + e.message);
      }
    });
  });

  context.subscriptions.push(listCmd, applyCmd, sendCmd);
}

export function deactivate() {
  // noop
}
