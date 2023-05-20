import chalk from 'chalk';
import debug from 'debug';
import { $ } from 'zx';

import {
    getCurrentBranchName,
    getDefaultBranchName,
    wasCommitMergedToDefaultBranch,
} from './git.js';

const debugFormatCommit = debug('git:format:commit');

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

            const starTime = performance.now();

            debugFormatCommit(`Getting merged status for ${commitHash}...`);

            const mergedCommitResult = await wasCommitMergedToDefaultBranch(
                commitHash,
            );

            debugFormatCommit(
                `Getting merged status for ${commitHash} done in ${(
                    (performance.now() - starTime) /
                    1000
                ).toFixed(2)} sec.`,
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
