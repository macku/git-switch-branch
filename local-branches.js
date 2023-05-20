import { $ } from 'zx';

import { formatCommit } from './formatters.js';

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
