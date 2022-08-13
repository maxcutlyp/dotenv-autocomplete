import * as vscode from 'vscode';
import * as path from 'path';
import * as glob from 'fast-glob';
import * as fs from 'fs';
import { parse } from 'dotenv';

const findProjectDir = (rootDir: string, fileName: string): string | null => {
    const dir = path.dirname(fileName);

    if (fs.existsSync(path.join(dir, 'package.json'))) {
        return dir;
    } else {
        return dir === rootDir ? null : findProjectDir(rootDir, dir);
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

        const envvarsScope: 'all' | 'project' | undefined = vscode.workspace
            .getConfiguration('dotenv-autocomplete')
            .get('envvarsScope');
        let envvars: Map<string, string | undefined> = new Map(
            envvarsScope === 'project' ? [] : Object.entries(process.env)
        );

        const rootDir = path.parse(document.fileName).root;
        const projectDir = findProjectDir(rootDir, document.fileName);

        if (projectDir) {
            let files = await glob('**/.env?(.*)', { cwd: projectDir });
            files.sort((a, b) => a.length - b.length);
            files = files.map(file => path.join(projectDir, file));

            for (const file of files) {
                let fileContent;
                try {
                    fileContent = fs.readFileSync(file, { encoding: 'utf8' });
                } catch {
                    // This is usually because the file doesn't exist,
                    // which may occur if the file is deleted between
                    // globbing and here.
                    continue;
                }
                const parsed = parse(fileContent);
                for (const [key, value] of Object.entries(parsed)) {
                    if (envvars.get(key) == null) {
                        envvars.set(key, value);
                    }
                }
            }
        }

        const showEnvvarsValues: boolean | undefined = vscode.workspace
            .getConfiguration('dotenv-autocomplete')
            .get('showEnvvarsValues');

        return [...envvars].map(envvar => {
            const completion = new vscode.CompletionItem(
                envvar[0].trim(),
                vscode.CompletionItemKind.Field
            );
            if (showEnvvarsValues) {
                completion.documentation = envvar[1];
            }

            return completion;
        });
    },
};

export default provider;
