# Log Keybindings

Adds two keybindings that allow you to quickly add debug logs for expressions. Log statements are configurable per-language and can be overridden in workspace or project configs if needed.

If an expression is selected it will be automatically inserted into the log statement. If nothing is selected then an empty log statement is added and the editor cursors are moved to the locations where the expression would have been placed.

## Extension Settings

### `log-keybindings.log-statements`

An object containing every log statement. The keys are language IDs. The values are a python-like format string.

Available format parameters:
* `{path}`: The full file path
* `{file}`: The file name
* `{line}`: The selection line
* `{expr}`: Required. The selected expression. Also marks the edit locations when no text is selected.

Example:

```json
{
    "log-keybindings.log-statements": {
        "java": "Main.LOG.info(\"{path}:{line} {}\", {expr});"
    }
}
```

## Extension Commands

* `log-keybindings.insert-pre`: Insert log on the previous line
* `log-keybindings.insert-post`: Insert log on the next line

## Extension Keybinds

* Control + Alt + C: Runs `log-keybindings.insert-pre`
* Control + Shift + C: Runs `log-keybindings.insert-post`

## Known Issues

None.

### 1.0.0

Initial release.
