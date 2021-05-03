#!/usr/bin/env node

import chalk from 'chalk';

import { getBuildResultsForCommit } from './bitbucket-api.js';
import { normalizeGitUrl } from './git-utils.js';
import {
    getCommitHashForCurrentBranch,
    getDefaultRemoteName,
    getGitUrl,
} from './git.js';

try {
    const remote = await getDefaultRemoteName();
    const gitUrl = await getGitUrl(remote);

    if (!gitUrl) {
        throw new Error(`Git remote is not set for ${remote}`);
    }

    // https://github.com/paulirish/git-open/blob/master/git-open
    const url = normalizeGitUrl(gitUrl);
    const commitHash = await getCommitHashForCurrentBranch();

    // Fetch build results
    const buildResults = await getBuildResultsForCommit(url, commitHash);

    if (!buildResults) {
        console.log(`
        ${chalk.bold(
            `We haven't found any builds for the ${chalk.green(
                commitHash,
            )} commit`,
        )}`);
        process.exit(0);
    }

    console.log(
        buildResults.length > 1
            ? `There are ${chalk.bold(
                  buildResults.length,
              )} builds for the ${chalk.bold.green(commitHash)} commit:`
            : `There is ${chalk.bold(
                  buildResults.length,
              )} build for the ${chalk.bold.green(commitHash)} commit:`,
    );

    for (let buildStatus of buildResults) {
        console.log('');
        console.log(`   ${buildStatus.name}`);
        console.log(`   ${buildStatus.url}`);
        console.log(
            `   ${
                buildStatus.state === 'SUCCESSFUL'
                    ? chalk.bold.green('✅ Successful')
                    : buildStatus.state === 'FAILED'
                    ? chalk.bold.red('❌ Failed')
                    : buildStatus.state === 'INPROGRESS'
                    ? chalk.bold.blue('🕑 In progress')
                    : chalk.bold.grey('❔ Unknown')
            }`,
        );
    }

    console.log('');
} catch (error) {
    console.log(
        `${chalk.bold('Ups. We have an error.')}\n\n${chalk.red(error.stack)}`,
    );
    process.exit(1);
}
