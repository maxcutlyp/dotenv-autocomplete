import * as vscode from 'vscode';
import envvarProvider from './envvarProvider';

const getProviderDisposable = (language: string): vscode.Disposable => {
    return vscode.languages.registerCompletionItemProvider(
        { scheme: 'file', language },
        envvarProvider,
        '.'
    );
};

export function activate(context: vscode.ExtensionContext) {
    console.log('"dotenv-autocomplete" is active!');

    const jsProviderDisposable = getProviderDisposable('javascript');
    const tsProviderDisposable = getProviderDisposable('typescript');
    const jsxProviderDisposable = getProviderDisposable('javascriptreact');
    const tsxProviderDisposable = getProviderDisposable('typescriptreact');

    context.subscriptions.push(
        jsProviderDisposable,
        tsProviderDisposable,
        jsxProviderDisposable,
        tsxProviderDisposable
    );
}

export function deactivate() {}
