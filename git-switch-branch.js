#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import inquirerPrompt from 'inquirer-autocomplete-prompt';
import { $ } from 'zx';

import { getLocalBranches } from './local-branches.js';
import { getRemoteBranches } from './remote-branches.js';

inquirer.registerPrompt('autocomplete', inquirerPrompt);

$.verbose = false;

try {
    const remoteOption = {
        name: '(show remote branches)',
        value: Symbol.for('remote'),
    };

    const localBranches = await getLocalBranches();

    let { branch } = await inquirer.prompt({
        type: 'autocomplete',
        name: 'branch',
        message: 'Type or select a recent local branch from the list',
        emptyText: "Can't find a local GIT branch...",
        source: (answers, input) => {
            input = input || '';

            const filteredOptions = [
                remoteOption,
                ...localBranches.filter(({ value }) =>
                    value.match(new RegExp(input, 'i')),
                ),
            ];

            return Promise.resolve(filteredOptions);
        },
    });

    if (branch === remoteOption.value) {
        const remoteBranches = await getRemoteBranches();

        ({ branch } = await inquirer.prompt({
            type: 'autocomplete',
            name: 'branch',
            message: 'Type or select a recent remote branch from the list',
            emptyText: "Can't find a remote GIT branch...",
            source: (answers, input) => {
                input = input || '';

                const filteredOptions = remoteBranches.filter(({ value }) =>
                    value.match(new RegExp(input, 'i')),
                );

                return Promise.resolve(filteredOptions);
            },
        }));
    }

    if (!branch) {
        // TODO: Add support for creating new branch
        process.exit();
    }

    // TODO: check if we can switch to a new branch
    const { stdout: gitResult, stderr: error } = await $`git co ${branch}`;

    console.log(`${chalk.bold('Branch switched to:')} ${chalk.green(branch)}`);
} catch (error) {
    console.error(error.stack);

    console.log(
        `${chalk.bold(
            'Ups. Cannot switch to branch due error:',
        )}\n\n${chalk.red(error)}`,
    );
    process.exit(1);
}