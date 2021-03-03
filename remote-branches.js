const util = require("util");
const { formatCommit } = require("./git.js");
const exec = util.promisify(require("child_process").exec);

async function getRemoteRefs() {
  const { stdout: remoteResult } = await exec("git remote");

  const remoteName = remoteResult.trim().split("\n")[0];

  const { stdout: refsResult } = await exec(
    `git for-each-ref --sort=-committerdate "refs/remotes/${remoteName}"`
  );

  const refsMeta = refsResult.trim().replace(/\t/g, " ").split("\n");

  return (
    refsMeta
      .map((refMeta) => {
        const [, commitHash, ref] = refMeta.match(
          /^([a-z0-9]+)\s[^\s]+\srefs\/remotes\/(.+)$/
        );

        return { commitHash, ref };
      })
      // Remove the HEAD
      .filter(({ ref }) => ref !== `${remoteName}/HEAD`)
  );
}

async function getRemoteBranches() {
  const remoteRefs = await getRemoteRefs();

  const remoteBranches = await Promise.all(
    remoteRefs.map(async ({ commitHash, ref }) => {
      const description = await formatCommit({ commitHash, ref });

      // Get branch name from remote ref
      const [_, ...branchParts] = ref.split("/");
      const branchRef = branchParts.join("/");

      return { branchRef, description };
    })
  );

  return remoteBranches.map(({ branchRef, description }) => ({
    name: description,
    value: branchRef,
  }));
}

module.exports = {
  getRemoteBranches,
};
