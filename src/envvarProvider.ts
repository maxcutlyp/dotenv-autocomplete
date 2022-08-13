import * as vscode from 'vscode';
import * as path from 'path';
import * as glob from 'fast-glob';
import * as fs from 'fs';
import { EOL } from 'os';

const findProjectDir = (fileName: string): string | null => {
    const dir = path.dirname(fileName);
    const root = path.parse(fileName).root;

    if (fs.existsSync(dir + '/package.json')) {
        return dir;
    } else {
        return dir === root ? null : findProjectDir(dir);
    }
};

const provider = {
    provideCompletionItems: async (
        document: vscode.TextDocument,
        position: vscode.Position
    ) => {
        const linePrefix = document
            .lineAt(position)
            .text.slice(0, position.character);
        if (!linePrefix.endsWith('process.env.')) {
            return undefined;
        }

        // Directory path must be normalized for Glob to work on Windows.
        // See: https://github.com/isaacs/node-glob#windows
        const projectDir = findProjectDir(document.fileName)
            ?.split(path.sep)
            .join('/');
        let envvars: Map<string, string | undefined> = new Map(
            Object.entries(process.env)
        );

        if (projectDir) {
            const files = await glob(`${projectDir}/**/.env?(.*)`);
            files.sort(
                (a, b) => path.basename(a).length - path.basename(b).length
            );

            files.forEach(file => {
                let fileContent;
                try {
                    fileContent = fs.readFileSync(file, { encoding: 'utf8' });
                } catch (err) {
                    // this is usually because the file doesn't exist,
                    // which may occur if the file is deleted between
                    // globbing and here.
                    return; // out of forEach callback
                }
                fileContent
                    .split(EOL)
                    // filter out comments
                    .filter(line => !line.trim().startsWith('#'))
                    // filter out invalid lines
                    .filter(line => line.includes('='))
                    .forEach(envvarLiteral => {
                        const [key, value] = envvarLiteral.split('=');
                        if (!envvars.get(key)) {
                            envvars.set(key, value);
                        }
                    });
            });
        }

        const showEnvvarsValues: boolean | undefined = vscode.workspace
            .getConfiguration('dotenv-autocomplete')
            .get('showEnvvarsValues');

        return [...envvars].map(envvar => {
            const completion = new vscode.CompletionItem(
                envvar[0].trim(),
                vscode.CompletionItemKind.Variable
            );
            if (showEnvvarsValues) {
                completion.documentation = envvar[1]?.trim();
            }

            return completion;
        });
    },
};

export default provider;
