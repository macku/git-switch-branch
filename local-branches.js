import { $ } from 'zx';

import { formatCommit } from './git.js';

async function getLocalRefs() {
    const result =
        await $`git for-each-ref --sort=-committerdate "refs/heads/"`;

    const refsMeta = result.toString().trim().replace(/\t/g, ' ').split('\n');

    return refsMeta.map((refMeta) => {
        const [, commitHash, ref] = refMeta.match(
            /^([a-z0-9]+)\s[^\s]+\srefs\/heads\/(.+)$/,
        );

        return { commitHash, ref };
    });
}

export async function getLocalBranches() {
    const localRefs = await getLocalRefs();

    const localBranches = await Promise.all(
        localRefs.map(async ({ commitHash, ref }) => {
            const description = await formatCommit({ commitHash, ref });
            const branchRef = ref;

            return { branchRef, description };
        }),
    );

    return localBranches.map(({ branchRef, description }) => ({
        name: description,
        value: branchRef,
    }));
}
