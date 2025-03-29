import { getRemoteRefs } from '../../git/git.ts';
import { formatCommit } from './formatters.ts';
import type { GetBranchesFn } from './types.ts';

export const getRemoteBranches: GetBranchesFn =
    async function getRemoteBranches({ withMergedStatus = false } = {}) {
        const remoteRefs = await getRemoteRefs();

        const remoteBranchesPromises = remoteRefs.map(({ commitHash, ref }) =>
            formatCommit({ commitHash, ref, withMergedStatus }).then(
                (label) => {
                    // Get branch name from remote ref
                    const [_, ...branchParts] = ref.split('/');
                    const branchRef = branchParts.join('/');

                    return {
                        name: label,
                        value: branchRef,
                    };
                }
            )
        );

        return await Promise.all(remoteBranchesPromises);
    };
