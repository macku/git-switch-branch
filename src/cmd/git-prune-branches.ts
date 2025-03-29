import inquirer from 'inquirer';
import { $, chalk } from 'zx';
import { ExitPromptError } from '@inquirer/core';

import {
    deleteBranch,
    getCurrentBranchName,
    getDefaultBranchName,
} from '../git/git.ts';
import { getLocalBranches } from './switch-branch/local-branches.ts';
import { configureInquirer } from '../helpers/inquirer-helper.ts';

$.verbose = false;

configureInquirer();

interface BranchOption {
    name: string;
    value: string;
    disabled?: boolean;
}

try {
    console.log(
        '👀 Getting list of local GIT branches. This can take a while if you have a lot of local branches or the repository is big...'
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
            localBranches.length
        )} local GIT branches.`
    );

    const { branches } = await inquirer.prompt<{ branches: string[] }>({
        type: 'checkbox',
        name: 'branches',
        message: 'Select local GIT branches to delete',
        pageSize: 15,
        choices: () =>
            // TODO: Maybe consider removing the current and default branches from the list?
            localBranches.map((option: BranchOption) => {
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
            `${chalk.bold('✅ No branches selected. Nothing to do, bye! 👋')}`
        );
        process.exit();
    }

    console.log();
    console.log(
        `${chalk.bold(
            `Selected branches (${branches.length}):`
        )}\n${chalk.green(branches.join('\n'))}`
    );

    const { answer } = await inquirer.prompt<{ answer: boolean }>({
        type: 'confirm',
        name: 'answer',
        default: false,
        message: `Are you sure you want to delete ${chalk.bold(
            `${branches.length} selected local branches`
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
        chalk.bold(
            `✅ All ${branches.length} selected local branches were deleted. Bye! 👋`
        )
    );
} catch (error) {
    if (error instanceof ExitPromptError) {
        // Exit gracefully
        process.exit();
    }

    console.log(
        `${chalk.bold(
            'Ups. Cannot prune branches due to an error:'
        )}\n\n${chalk.red((error as Error).stack)}`
    );
    process.exit(1);
}
