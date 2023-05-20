import { formatCommit } from './formatters.js';
import { getRemoteRefs } from './git.js';

export async function getRemoteBranches({ withMergedStatus = false } = {}) {
    const remoteRefs = await getRemoteRefs();

    const remoteBranchesPromises = remoteRefs.map(({ commitHash, ref }) =>
        formatCommit({ commitHash, ref, withMergedStatus }).then((label) => {
            // Get branch name from remote ref
            const [_, ...branchParts] = ref.split('/');
            const branchRef = branchParts.join('/');

            return {
                name: label,
                value: branchRef,
            };
        }),
    );

    return await Promise.all(remoteBranchesPromises);
}
