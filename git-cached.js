import debug from 'debug';
import { FileSystemCache } from 'file-system-cache';
import findCacheDirectory from 'find-cache-dir';

import { wasCommitMergedToDefaultBranch } from './git.js';

const debugMergeStatus = debug('git:merge:status');
const cacheDirectory = findCacheDirectory({ name: 'git-switch-branch' });

const cache = new FileSystemCache({
    basePath: cacheDirectory,
    ns: 'was-commit-merged-to-a-default-branch',
});

const NO_VALUE = Symbol.for('NO_VALUE');

export async function wasCommitMergedToDefaultBranchCached(
    defaultRemoteBranchName,
    defaultRemoteBranchRef,
    commitHash,
) {
    const starTime = performance.now();
    debugMergeStatus(`Getting merged status for ${commitHash}...`);

    const cacheKey = [
        defaultRemoteBranchName,
        defaultRemoteBranchRef,
        commitHash,
    ].join(':');

    let value;

    try {
        value = await cache.get(cacheKey, NO_VALUE);
        debugMergeStatus(`Found merge status in cache for ${commitHash}`);
    } catch (e) {}

    if (value === NO_VALUE) {
        debugMergeStatus(`No merge status in cache for ${commitHash}`);
        value = await wasCommitMergedToDefaultBranch(
            defaultRemoteBranchName,
            defaultRemoteBranchRef,
            commitHash,
        );

        try {
            await cache.set(cacheKey, value);
        } catch (e) {}
    }

    debugMergeStatus(
        `Getting merged status for ${commitHash} done in ${(
            (performance.now() - starTime) /
            1000
        ).toFixed(2)} sec.`,
    );

    debugMergeStatus(value);

    return value;
}
