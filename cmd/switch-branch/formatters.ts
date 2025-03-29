import chalk from 'chalk';

import {
    getCommitDateAndAuthorCached,
    wasCommitMergedToDefaultBranchCached,
} from '../../git/git-cached.ts';
import {
    getCurrentBranchName,
    getDefaultBranchName,
    getDefaultRemoteBranchName,
    getDefaultRemoteBranchRef,
} from '../../git/git.ts';

interface FormatCommitOptions {
    commitHash: string;
    ref: string;
    withHash?: boolean;
    withMergedStatus?: boolean;
}

export async function formatCommit({
    commitHash,
    ref,
    withHash = true,
    withMergedStatus = false,
}: FormatCommitOptions): Promise<string> {
    const { commitDate, commitAuthor } =
        await getCommitDateAndAuthorCached(commitHash);

    let formattedMergedStatus = '';
    let formattedHash = '';

    if (withHash) {
        formattedHash = `  ${chalk.bold.red(commitHash.slice(0, 7))}`;
    }

    if (withMergedStatus) {
        formattedMergedStatus = await (async () => {
            if (ref === (await getCurrentBranchName())) {
                return `${chalk.bold('⏹️  current branch')} - `;
            }

            if (ref === (await getDefaultBranchName())) {
                return `${chalk.bold('⏹️  default branch')} - `;
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
                    commitHash
                );

            if (mergedCommitResult) {
                return `${chalk.bold('✅ merged')}         - `;
            } else {
                return `${chalk.bold('❌ not merged')}     - `;
            }
        })();
    }

    const formattedRef = `${chalk.green(ref)}`;
    const formattedDate = `  ${chalk.yellow(`(${commitDate})`)}`;
    const formattedAuthor = ` ${chalk.blue(commitAuthor)}`;

    return [
        formattedMergedStatus,
        formattedRef,
        formattedHash,
        formattedDate,
        formattedAuthor,
    ].join('');
}
