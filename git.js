import { $ } from 'zx';

$.verbose = false;

const defaultRemoteBranchNamePromise = new Promise(async (resolve) => {
    const remoteName = await getDefaultRemoteName();
    const result =
        await $`git symbolic-ref --short refs/remotes/${remoteName}/HEAD`;
    const defaultRemoteBranchName = result.toString().trim();

    resolve(defaultRemoteBranchName);
});

export async function getDefaultRemoteBranchName() {
    return defaultRemoteBranchNamePromise;
}

export async function getDefaultBranchName() {
    const defaultRemoteBranchName = await getDefaultRemoteBranchName();

    return defaultRemoteBranchName.split('/').pop();
}

export async function getCurrentBranchName() {
    const result = await $`git branch --show-current`;

    return result.toString().trim();
}

export async function getDefaultRemoteName() {
    // TODO: This is a bit naive approach since there might be more remotes
    const remoteResult = await $`git remote`;

    return remoteResult.toString().trim().split('\n')[0];
}

export async function deleteBranch(branchName) {
    await $`git branch -D ${branchName}`;
}

export async function getLocalRefs() {
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

export async function getRemoteRefs() {
    const remoteName = await getDefaultRemoteName();

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

export async function checkIfCommitWasMergedToDefaultBranch(commitHash) {
    const defaultRemoteBranchName = await getDefaultRemoteBranchName();

    const result =
        await $`git branch -r ${defaultRemoteBranchName} --contains ${commitHash}`;

    // The result is not empty when GIT lists a branch that contains the given commit
    return result.toString().trim() !== '';
}
