import { getLocalRefs } from '../../git/git.ts';
import { formatCommit } from './formatters.ts';
import type { GetBranchesFn } from './types.ts';

export const getLocalBranches: GetBranchesFn = async function getLocalBranches({
    withMergedStatus = false,
} = {}) {
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
};
