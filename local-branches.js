import { formatCommit } from './formatters.js';
import { getLocalRefs } from './git.js';

export async function getLocalBranches({ withMergedStatus = false } = {}) {
    const localRefs = await getLocalRefs();

    const localBranchesPromises = localRefs.map(({ commitHash, ref }) =>
        formatCommit({
            commitHash,
            ref,
            withMergedStatus,
        }).then((label) => ({
            name: label,
            value: ref,
        })),
    );

    return await Promise.all(localBranchesPromises);
}
