import { formatCommit } from './formatters.js';
import { getRemoteRefs } from './git.js';

export async function getRemoteBranches() {
    const remoteBranches = [];

    for (const { commitHash, ref } of await getRemoteRefs()) {
        const description = await formatCommit({ commitHash, ref });

        // Get branch name from remote ref
        const [_, ...branchParts] = ref.split('/');
        const branchRef = branchParts.join('/');

        remoteBranches.push({
            name: description,
            value: branchRef,
        });
    }

    return remoteBranches;
}
