import chalk from 'chalk';
import { ExitPromptError } from '@inquirer/core';
import { search, Separator } from '@inquirer/prompts';
import { $ } from 'zx';

import { getLocalBranches } from './switch-branch/local-branches.ts';
import { getRemoteBranches } from './switch-branch/remote-branches.ts';
import { configureInquirer } from '../helpers/inquirer-helper.ts';

$.verbose = false;

configureInquirer();

interface Choice {
    name: string;
    value: string | Symbol;
}

try {
    const remoteOption = {
        name: '(show remote branches)',
        value: Symbol.for('remote'),
    };

    console.log('👀 Getting list of local GIT branches...');

    const localBranches = await getLocalBranches();

    console.log(
        `🔎 We have found ${chalk.bold(
            localBranches.length
        )} local GIT branches.`
    );

    let branch = await search({
        message: 'Type or select a recent local branch from the list',
        // emptyText: "Can't find any local GIT branches...",
        pageSize: 15,
        source: (term) => {
            term = term || '';

            const filteredOptions: Array<Choice | Separator> = [];

            if (term === '') {
                filteredOptions.push(remoteOption);
                filteredOptions.push(new Separator());
            }

            filteredOptions.push(
                ...localBranches.filter(({ value }) =>
                    value.match(new RegExp(term, 'i'))
                )
            );

            // Show remote option if we can't find any branches
            if (filteredOptions.length === 0) {
                filteredOptions.push(remoteOption);
            }

            return Promise.resolve(filteredOptions);
        },
    });

    if (branch === remoteOption.value) {
        console.log('👀 Getting list of local and remote GIT branches...');

        const remoteBranches = await getRemoteBranches();

        console.log(
            `🔎 We have found ${chalk.bold(
                remoteBranches.length
            )} local and remote GIT branches.`
        );

        branch = await search({
            message: 'Type or select a recent remote branch from the list',
            // emptyText: "Can't find a remote GIT branch...",
            pageSize: 15,
            source: (term) => {
                term = term || '';

                const filteredOptions = remoteBranches.filter(({ value }) =>
                    value.match(new RegExp(term, 'i'))
                );

                return Promise.resolve(filteredOptions);
            },
        });
    }

    if (!branch) {
        // TODO: Add support for creating new branch
        process.exit();
    }

    // TODO: check if we can switch to a new branch
    await $`git checkout ${branch}`;

    console.log(
        `✅ ${chalk.bold('Branch switched to:')} ${chalk.green(branch)}`
    );
} catch (error) {
    if (error instanceof ExitPromptError) {
        // Exit gracefully
        process.exit();
    }

    console.log(
        `${chalk.bold(
            'Ups. Cannot switch to a branch due to an error:'
        )}\n\n${chalk.red((error as Error).stack)}`
    );

    process.exit(1);
}
