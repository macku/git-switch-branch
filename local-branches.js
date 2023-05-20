import { formatCommit } from './formatters.js';
import { getLocalRefs } from './git.js';

export async function getLocalBranches({ withMergedStatus = false } = {}) {
    const localBranches = [];

    for (const { commitHash, ref } of await getLocalRefs()) {
        const description = await formatCommit({
            commitHash,
            ref,
            withMergedStatus: withMergedStatus,
        });

        localBranches.push({ name: description, value: ref });
    }

    return localBranches;
}
