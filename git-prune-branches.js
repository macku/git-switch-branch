#!/usr/bin/env node

import chalk from 'chalk';
import inquirer from 'inquirer';
import { $ } from 'zx';

import {
    deleteBranch,
    getCurrentBranchName,
    getDefaultBranchName,
} from './git.js';
import { getLocalBranches } from './local-branches.js';

$.verbose = false;

try {
    console.log(
        '👀 Getting list of local GIT branches. This can take a while if you have a lot of local branches or the repository is big...',
    );

    const [localBranches, defaultBranchName, currentBranchName] =
        await Promise.all([
            getLocalBranches({
                withMergedStatus: true,
            }),
            getDefaultBranchName(),
            getCurrentBranchName(),
        ]);

    console.log(
        `🔎 We have found ${chalk.bold(
            localBranches.length,
        )} local GIT branches.`,
    );

    let { branches } = await inquirer.prompt({
        type: 'checkbox',
        name: 'branches',
        message: 'Select local GIT branches to delete',
        emptyText: "Can't find any local GIT branches...",
        pageSize: 15,
        choices: () =>
            // TODO: Maybe consider removing the current and default branches from the list?
            localBranches.map((option) => {
                if (
                    option.value === defaultBranchName ||
                    option.value === currentBranchName
                ) {
                    option.disabled = true;
                }

                return option;
            }),
    });

    if (!branches.length) {
        console.log(
            `${chalk.bold('✅ No branches selected. Nothing to do, bye! 👋')}`,
        );
        process.exit();
    }

    console.log();
    console.log(
        `${chalk.bold(
            `Selected branches (${branches.length}):`,
        )}\n${chalk.green(branches.join('\n'))}`,
    );

    let { answer } = await inquirer.prompt({
        type: 'confirm',
        name: 'answer',
        default: false,
        message: `Are you sure you want to delete ${chalk.bold(
            `${branches.length} selected local branches`,
        )}?`,
    });

    if (!answer) {
        console.log(`${chalk.bold('✅ No branches were deleted. Bye! 👋')}`);
        process.exit();
    }

    // Let's delete them!
    for (const branch of branches) {
        await deleteBranch(branch);
    }

    console.log(
        `${chalk.bold(
            `✅ All ${branches.length} selected local branches were deleted. Bye! 👋`,
        )}`,
    );
} catch (error) {
    console.error(error.stack);

    console.log(
        `${chalk.bold(
            'Ups. Cannot switch to branch due error:',
        )}\n\n${chalk.red(error)}`,
    );
    process.exit(1);
}
