import { $ } from 'zx';

import { formatCommit } from './git.js';

async function getRemoteRefs() {
    const remoteResult = await $`git remote`;
    const remoteName = remoteResult.toString().trim().split('\n')[0];

    const refsResult =
        await $`git for-each-ref --sort=-committerdate "refs/remotes/${remoteName}"`;
    const refsMeta = refsResult
        .toString()
        .trim()
        .replace(/\t/g, ' ')
        .split('\n');

    return (
        refsMeta
            .map((refMeta) => {
                const [, commitHash, ref] = refMeta.match(
                    /^([a-z0-9]+)\s[^\s]+\srefs\/remotes\/(.+)$/,
                );

                return { commitHash, ref };
            })
            // Remove the HEAD
            .filter(({ ref }) => ref !== `${remoteName}/HEAD`)
    );
}

export async function getRemoteBranches() {
    const remoteRefs = await getRemoteRefs();

    const remoteBranches = await Promise.all(
        remoteRefs.map(async ({ commitHash, ref }) => {
            const description = await formatCommit({ commitHash, ref });

            // Get branch name from remote ref
            const [_, ...branchParts] = ref.split('/');
            const branchRef = branchParts.join('/');

            return { branchRef, description };
        }),
    );

    return remoteBranches.map(({ branchRef, description }) => ({
        name: description,
        value: branchRef,
    }));
}
