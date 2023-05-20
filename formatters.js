import chalk from 'chalk';
import { $ } from 'zx';

import { getDefaultRemoteBranchName } from './git.js';

export async function formatCommit({
    commitHash,
    ref,
    withHash = true,
    withMergedStatus = false,
}) {
    const result = await $`git log -1 --pretty="%ar\t%cn" ${commitHash}`;
    const [date, author] = result.toString().trim().split('\t');

    let formattedMergedStatus = '';
    let formattedHash = '';

    if (withHash) {
        formattedHash = `  ${chalk.bold.red(commitHash.slice(0, 7))}`;
    }

    if (withMergedStatus) {
        const defaultRemoteBranchName = await getDefaultRemoteBranchName();
        const mergedBranchResult =
            await $`git branch -r ${defaultRemoteBranchName} --contains ${commitHash}`;

        if (mergedBranchResult.toString().trim() === '') {
            formattedMergedStatus = `${chalk.bold('❌ not merged')} - `;
        } else {
            formattedMergedStatus = `${chalk.bold('✅ merged')}     - `;
        }
    }

    const formattedRef = `${chalk.green(ref)}`;
    const formattedDate = `  ${chalk.yellow(`(${date})`)}`;
    const formattedAuthor = ` ${chalk.blue(author)}`;

    return [
        formattedMergedStatus,
        formattedRef,
        formattedHash,
        formattedDate,
        formattedAuthor,
    ].join('');
}
