const util = require("util");
const chalk = require("chalk");
const exec = util.promisify(require("child_process").exec);

async function getRemoteRefs() {
  const { stdout: remoteResult } = await exec("git remote");

  const remoteName = remoteResult.trim().split("\n")[0];

  const { stdout: refsResult } = await exec(
    `git for-each-ref --sort=-committerdate "refs/remotes/${remoteName}"`
  );

  const remoteRefs = refsResult.trim().replace(/\t/g, " ").split("\n");

  return remoteRefs.map((ref) => {
    const [, commitHash, remoteRef] = ref.match(
      /^([a-z0-9]+)\s[^\s]+\srefs\/remotes\/(.+)$/
    );

    return { commitHash, remoteRef };
  });
}

async function getRemoteBranches() {
  const remoteRefs = await getRemoteRefs();

  const remoteBranches = await Promise.all(
    remoteRefs.map(async ({ commitHash, remoteRef }) => {
      const { stdout: result } = await exec(
        `git log -1 --pretty="%ar\t%cn" ${commitHash}`
      );
      const [date, author] = result.trim().split("\t");

      const description = `${chalk.green(remoteRef)}\t${chalk.yellow(
        `(${date})`
      )}\t${chalk.blue(author)}`;

      // Get branch name from remote ref
      const [_, ...branchParts] = remoteRef.split("/");
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
