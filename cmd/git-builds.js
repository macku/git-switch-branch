#!/usr/bin/env node

import chalk from 'chalk';

import { getBuildsProvider } from '../builds-providers/builds-provider.js';
import { normalizeRemoteUrl } from '../git/git-utils.js';
import {
    getCommitHashForCurrentBranch,
    getCurrentBranchName,
    getRemoteForBranch,
    getRemoteUrl,
} from '../git/git.js';

try {
    const branchName = await getCurrentBranchName();
    const branchRemote = await getRemoteForBranch(branchName);
    const remoteUrl = await getRemoteUrl(branchRemote);

    if (!remoteUrl) {
        throw new Error(`Git remote is not set for ${branchRemote}`);
    }

    const commitHash = await getCommitHashForCurrentBranch();

    console.log(
        `👀 Searching for builds for branch ${chalk.bold(
            '%s'
        )} with commit ${chalk.bold('%s')}...`,
        branchName,
        commitHash
    );

    const normalizedRemoteUrl = normalizeRemoteUrl(remoteUrl);
    const buildsProvider = await getBuildsProvider(normalizedRemoteUrl);

    if (!buildsProvider || typeof buildsProvider !== 'function') {
        throw new Error(
            `Can't find or resolve builds provider for ${remoteUrl.toString()} GIT remote`
        );
    }

    const buildResults = await buildsProvider({
        commitHash,
        branchName,
        remoteUrl: normalizedRemoteUrl,
    });

    if (!buildResults) {
        console.log(`
        ${chalk.bold(
            `🤔 We haven't found any builds for the ${chalk.green(
                commitHash
            )} commit`
        )}`);
        process.exit(0);
    }

    console.log(
        buildResults.length > 1
            ? `🔎 There are ${chalk.bold(
                  buildResults.length
              )} builds for the ${chalk.green(commitHash)} commit:`
            : `🔎 There is ${chalk.bold(
                  buildResults.length
              )} build for the ${chalk.green(commitHash)} commit:`
    );

    for (let buildStatus of buildResults) {
        console.log('');
        console.log(
            `   ${
                buildStatus.state === 'SUCCESSFUL'
                    ? chalk.green('✅ Successful')
                    : buildStatus.state === 'FAILED'
                    ? chalk.bold.red('❌ Failed')
                    : buildStatus.state === 'INPROGRESS'
                    ? chalk.bold.blue('🕑 In progress')
                    : chalk.bold.grey('❔ Unknown')
            } - ${chalk.bold(buildStatus.name)}`
        );
        console.log(`   ${buildStatus.url}`);
    }

    console.log('');
} catch (error) {
    console.log(
        `${chalk.bold('Ups. We have an error.')}\n\n${chalk.red(error.stack)}`
    );
    process.exit(1);
}
