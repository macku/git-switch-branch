import chalk from 'chalk';
import { $ } from 'zx';

import { wasCommitMergedToDefaultBranchCached } from './git-cached.js';
import {
    getCurrentBranchName,
    getDefaultBranchName,
    getDefaultRemoteBranchName,
    getDefaultRemoteBranchRef,
} from './git.js';

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
        formattedMergedStatus = await (async () => {
            if (ref === (await getDefaultBranchName())) {
                return `${chalk.bold('⏹️  default branch')} - `;
            }

            if (ref === (await getCurrentBranchName())) {
                return `${chalk.bold('⏹️  current branch')} - `;
            }

            const [defaultRemoteBranchName, defaultRemoteBranchRef] =
                await Promise.all([
                    getDefaultRemoteBranchName(),
                    getDefaultRemoteBranchRef(),
                ]);

            const mergedCommitResult =
                await wasCommitMergedToDefaultBranchCached(
                    defaultRemoteBranchName,
                    defaultRemoteBranchRef,
                    commitHash,
                );

            if (mergedCommitResult) {
                return `${chalk.bold('✅ merged')}         - `;
            } else {
                return `${chalk.bold('❌ not merged')}     - `;
            }
        })();
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
