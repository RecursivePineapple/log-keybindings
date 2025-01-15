import * as vscode from 'vscode';

function format(fmt: string, args: {[key:string]:string}) {
	for (const [key, value] of Object.entries(args)) {
		fmt = fmt.replaceAll(`{${key}}`, value);
	}

    return fmt;
}

export function activate(context: vscode.ExtensionContext) {

	let output = vscode.window.createOutputChannel("Log Keybindings", "log");

	const warning = (message: string) => {
		const now = new Date();

		output.appendLine(`[${now.toISOString()}] WARNING: ${message}`);
	};

	const insertLog = async (after: boolean) => {

		const editor = vscode.window.activeTextEditor;

		if (!editor) {
			warning("No editor open");
			return;
		};

		let snippet: string | undefined = vscode.workspace.getConfiguration("log-keybindings.log-statements").get(editor.document.languageId);

		if (!snippet) {
			warning(`Language '${editor.document.languageId}' has no log-statement set`);
			return;
		};
		
		const sel = editor.selection;

		if (!sel.isSingleLine) {
			warning(`Selection must be a single line`);
			return;
		}

		if (!sel.anchor.isEqual(sel.active)) {
			snippet = format(snippet, {
				"path": editor.document.uri.path,
				"file": editor.document.fileName,
				"line": String(editor.selection.active.line + 1),
				"expr": editor.document.getText(sel)
					.replaceAll("\"", "\\\"")
					.replaceAll("\'", "\\\'")
			});
		} else {
			snippet = format(snippet, {
				"path": editor.document.uri.path,
				"file": editor.document.fileName,
				"line": String(editor.selection.active.line + 1),
			});
		}

		const edits = [];

		while (snippet.includes("{expr}")) {
			edits.push(snippet.indexOf("{expr}"));
			snippet = snippet.replace("{expr}", "");
		}

		const line = editor.document.getText(new vscode.Range(sel.active.line, 0, sel.active.line, Number.MAX_SAFE_INTEGER));
		const match = line.match(/^\s*/);
		const indent = match && match[0] || "";

		const selections = [...editor.selections];

		await editor.edit(
			builder => {
				if (after) {
					builder.insert(new vscode.Position(sel.active.line, line.length), `\n${indent}${snippet}`);
				} else {
					builder.insert(new vscode.Position(sel.active.line, 0), `${indent}${snippet}\n`);
				}
			},
			{
				undoStopBefore: true,
				undoStopAfter: false,
			}
		);

		if (edits.length > 0) {
			let line = sel.active.line;
			if (after) line++;

			editor.selections = edits.map(e => new vscode.Selection(line, e + indent.length, line, e + indent.length));
		} else {
			if (after) {
				editor.selections = selections;
			}
		}
	};

	context.subscriptions.push(vscode.commands.registerCommand('log-keybindings.insert-pre', async () => {
		await insertLog(false);
	}));

	context.subscriptions.push(vscode.commands.registerCommand('log-keybindings.insert-post', async () => {
		await insertLog(true);
	}));
}

export function deactivate() {}
