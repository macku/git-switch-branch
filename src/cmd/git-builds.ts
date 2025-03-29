#!/usr/bin/env node --experimental-strip-types

import { chalk } from 'zx';

import { getBuildsProvider } from '../builds-providers/builds-provider.ts';
import { normalizeRemoteUrl } from '../git/git-utils.ts';
import {
    getCommitHashForCurrentBranch,
    getCurrentBranchName,
    getRemoteForBranch,
    getRemoteUrl,
} from '../git/git.ts';
import type { BuildsResults } from '../builds-providers/types.ts';

try {
    const branchName: string = await getCurrentBranchName();
    const branchRemote: string = await getRemoteForBranch(branchName);
    const remoteUrl: string = await getRemoteUrl(branchRemote);

    if (!remoteUrl) {
        throw new Error(`Git remote is not set for ${branchRemote}`);
    }

    const commitHash: string = await getCommitHashForCurrentBranch();

    console.log(
        `👀 Searching for builds for branch %s with commit %s...`,
        chalk.bold(branchName),
        chalk.bold(commitHash)
    );

    const normalizedRemoteUrl: URL = normalizeRemoteUrl(remoteUrl);
    const buildsProvider = await getBuildsProvider(normalizedRemoteUrl);

    if (!buildsProvider || typeof buildsProvider !== 'function') {
        throw new Error(
            `Can't find or resolve builds provider for ${remoteUrl.toString()} GIT remote`
        );
    }

    const buildResults: BuildsResults = await buildsProvider({
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

    // TODO: Group job IDs by pipeline ID

    // TODO: Show overall pipeline status
    if (buildResults.pipelineUrl) {
        console.log();
        console.log(`   Pipeline: ${buildResults.pipelineUrl}`);
    }

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
                        : buildStatus.state === 'PENDING'
                          ? chalk.bold.yellow('⏳ Pending')
                          : buildStatus.state === 'SKIPPED'
                            ? chalk.bold.yellow('⏭️ Skipped')
                            : buildStatus.state === 'CANCELLED'
                              ? chalk.bold.grey('❌ Cancelled')
                              : chalk.bold.grey('❔ Unknown')
            } - ${chalk.bold(buildStatus.name)}`
        );
        console.log(`   ${buildStatus.url}`);
    }

    console.log('');
} catch (err) {
    const error = err as Error;

    console.log(
        `${chalk.bold('Ups. We have an error.')}\n\n${chalk.red(error.stack)}`
    );
    process.exit(1);
}
