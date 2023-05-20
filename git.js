import { $ } from 'zx';

$.verbose = false;

const defaultRemoteBranchNamePromise = new Promise(async (resolve) => {
    const result = await $`git symbolic-ref --short refs/remotes/origin/HEAD`;
    const defaultRemoteBranchName = result.toString().trim();

    resolve(defaultRemoteBranchName);
});

export async function getDefaultRemoteBranchName() {
    return defaultRemoteBranchNamePromise;
}

export async function deleteBranch(branchName) {
    await $`git branch -D ${branchName}`;
}
