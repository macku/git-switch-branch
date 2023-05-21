import debug from 'debug';
import { FileSystemCache } from 'file-system-cache';
import findCacheDirectory from 'find-cache-dir';

import {
    getCommitDateAndAuthor,
    wasCommitMergedToDefaultBranch,
} from './git.js';

const debugGit = debug('git');
const cacheDirectory = findCacheDirectory({ name: 'git-switch-branch' });

const cache = new FileSystemCache({
    basePath: cacheDirectory,
});

const NO_VALUE = Symbol.for('NO_VALUE');

export async function wasCommitMergedToDefaultBranchCached(
    defaultRemoteBranchName,
    defaultRemoteBranchRef,
    commitHash
) {
    const starTime = performance.now();
    debugGit(`Getting merged status for ${commitHash}...`);

    const cacheKey = [
        'merge-status',
        defaultRemoteBranchName,
        defaultRemoteBranchRef,
        commitHash,
    ].join(':');

    let value;

    try {
        value = await cache.get(cacheKey, NO_VALUE);
        debugGit(`Found merge status in cache for ${commitHash}`);
    } catch (e) {}

    if (value === NO_VALUE) {
        debugGit(`No merge status in cache for ${commitHash}`);
        value = await wasCommitMergedToDefaultBranch(
            defaultRemoteBranchName,
            defaultRemoteBranchRef,
            commitHash
        );

        try {
            await cache.set(cacheKey, value);
        } catch (e) {}
    }

    debugGit(
        `Getting merged status for ${commitHash} done in ${(
            (performance.now() - starTime) /
            1000
        ).toFixed(2)} sec.`
    );

    return value;
}
export async function getCommitDateAndAuthorCached(commitHash) {
    const starTime = performance.now();
    debugGit(`Getting commit date and author ${commitHash}...`);

    const cacheKey = ['commit-date', commitHash].join(':');

    let value;

    try {
        value = await cache.get(cacheKey, NO_VALUE);
        debugGit(`Found commit date ${commitHash}`);
    } catch (e) {}

    if (value === NO_VALUE) {
        debugGit(`No commit date in cache for ${commitHash}`);
        value = await getCommitDateAndAuthor(commitHash);

        try {
            await cache.set(cacheKey, value);
        } catch (e) {}
    }

    debugGit(
        `Getting commit date ${commitHash} done in ${(
            (performance.now() - starTime) /
            1000
        ).toFixed(2)} sec.`,
        value
    );

    return value;
}
