import { $ } from 'zx';

$.verbose = false;

const DEFAULT_REMOTE = 'origin';

export async function getDefaultRemoteName(): Promise<string> {
    // TODO: This is a bit naive approach since there might be more remotes
    const remoteResult = await $`git remote`;

    return remoteResult.toString().trim().split('\n')[0] || DEFAULT_REMOTE;
}

// Singleton promises
const defaultRemoteBranchNamePromise: Promise<string> = new Promise(
    async (resolve) => {
        const remoteName = await getDefaultRemoteName();
        const result =
            await $`git symbolic-ref --short refs/remotes/${remoteName}/HEAD`;
        const defaultRemoteBranchName = result.toString().trim();

        resolve(defaultRemoteBranchName);
    }
);

const defaultRemoteBranchRefPromise: Promise<string> = new Promise(
    async (resolve) => {
        const defaultRemoveBranchName = await defaultRemoteBranchNamePromise;
        const result =
            await $`git rev-parse --quiet ${defaultRemoveBranchName}`;
        const defaultRemoteBranchRef = result.toString().trim();

        resolve(defaultRemoteBranchRef);
    }
);

const currentBranchNamePromise: Promise<string> = new Promise(
    async (resolve) => {
        const result = await $`git branch --show-current`;

        const currentBranchName = result.toString().trim();

        resolve(currentBranchName);
    }
);

export async function getDefaultRemoteBranchName(): Promise<string> {
    return defaultRemoteBranchNamePromise;
}

export async function getDefaultRemoteBranchRef(): Promise<string> {
    return defaultRemoteBranchRefPromise;
}

export async function getDefaultBranchName(): Promise<string> {
    const defaultRemoteBranchName = await getDefaultRemoteBranchName();

    return defaultRemoteBranchName.split('/').pop() || '';
}

export async function getCurrentBranchName(): Promise<string> {
    return currentBranchNamePromise;
}

export async function deleteBranch(branchName: string): Promise<void> {
    await $`git branch -D ${branchName}`;
}

interface GitRef {
    commitHash: string;
    ref: string;
}

export async function getLocalRefs(): Promise<GitRef[]> {
    const result =
        await $`git for-each-ref --sort=-committerdate "refs/heads/"`;

    const refsMeta = result.toString().trim().replace(/\t/g, ' ').split('\n');

    // Handle empty result
    if (refsMeta[0] === '') return [];

    return refsMeta.map((refMeta) => {
        const match = refMeta.match(/^([a-z0-9]+)\s[^\s]+\srefs\/heads\/(.+)$/);
        if (!match) {
            throw new Error(`Failed to parse ref metadata: ${refMeta}`);
        }
        const [, commitHash, ref] = match;

        return { commitHash, ref };
    });
}

export async function getRemoteRefs(): Promise<GitRef[]> {
    const remoteName = await getDefaultRemoteName();

    const refsResult =
        await $`git for-each-ref --sort=-committerdate "refs/remotes/${remoteName}"`;
    const refsMeta = refsResult
        .toString()
        .trim()
        .replace(/\t/g, ' ')
        .split('\n');

    // Handle empty result
    if (refsMeta[0] === '') return [];

    return (
        refsMeta
            .map((refMeta) => {
                const match = refMeta.match(
                    /^([a-z0-9]+)\s[^\s]+\srefs\/remotes\/(.+)$/
                );
                if (!match) {
                    throw new Error(
                        `Failed to parse remote ref metadata: ${refMeta}`
                    );
                }
                const [, commitHash, ref] = match;

                return { commitHash, ref };
            })
            // Remove the HEAD
            .filter(({ ref }) => ref !== `${remoteName}/HEAD`)
    );
}

export async function wasCommitMergedToDefaultBranch(
    defaultRemoteBranchName: string,
    defaultRemoteBranchRef: string,
    commitHash: string
): Promise<boolean> {
    // The result is not empty when GIT lists a branch that contains the given commit
    const defaultBranchIncludesLastCommitResult =
        (
            await $`git branch -r ${defaultRemoteBranchName} --contains ${commitHash}`
        )
            .toString()
            .trim() !== '';

    // Now, let's check squashed branches
    // Inspired by https://blog.takanabe.tokyo/en/2020/04/remove-squash-merged-local-git-branches/
    const ancestor =
        await $`git merge-base ${defaultRemoteBranchRef} ${commitHash}`;
    const gitRevParseResult = await $`git rev-parse ${commitHash}^{tree}`;
    const gitCommitTreeResult =
        await $`git commit-tree ${gitRevParseResult} -p ${ancestor} -m _`;
    const gitCherryResult =
        await $`git cherry ${defaultRemoteBranchRef} ${gitCommitTreeResult}`;

    const commitWasSquashMerged = gitCherryResult
        .toString()
        .trim()
        .startsWith('-');

    return defaultBranchIncludesLastCommitResult || commitWasSquashMerged;
}

interface CommitInfo {
    commitDate: string;
    commitAuthor: string;
}

export async function getCommitDateAndAuthor(
    commitHash: string
): Promise<CommitInfo> {
    const result = await $`git log -1 --pretty="%ar\t%cn" ${commitHash}`;

    const [commitDate, commitAuthor] = result.toString().trim().split('\t');

    return { commitDate, commitAuthor };
}

export async function getCommitHashForCurrentBranch(): Promise<string> {
    const result = await $`git rev-parse HEAD`;

    return result.toString().trim();
}

export async function getRemoteForBranch(branch: string): Promise<string> {
    const result = await $`git config "branch.${branch}.remote"`;

    return result.toString().trim();
}

export async function getRemoteUrl(remote: string): Promise<string> {
    const result = await $`git ls-remote --get-url "${remote}"`;

    return result.toString().trim();
}
