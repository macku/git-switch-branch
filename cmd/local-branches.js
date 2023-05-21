import { getLocalRefs } from '../git/git.js';
import { formatCommit } from './formatters.js';

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
        }))
    );

    return await Promise.all(localBranchesPromises);
}
