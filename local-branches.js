const util = require("util");
const chalk = require("chalk");
const exec = util.promisify(require("child_process").exec);

async function getLocalRefs() {
  const { stdout: result } = await exec(
    'git for-each-ref --sort=-committerdate "refs/heads/"'
  );

  const localRefs = result.trim().replace(/\t/g, " ").split("\n");

  return localRefs.map((ref) => {
    const [, commitHash, branchRef] = ref.match(
      /^([a-z0-9]+)\s[^\s]+\srefs\/heads\/(.+)$/
    );

    return { commitHash, branchRef };
  });
}

async function getLocalBranches() {
  const localRefs = await getLocalRefs();

  const localBranches = await Promise.all(
    localRefs.map(async ({ commitHash, branchRef }) => {
      const { stdout: result } = await exec(
        `git log -1 --pretty="%ar\t%cn" ${commitHash}`
      );
      const [date, author] = result.trim().split("\t");

      const description = `${chalk.green(branchRef)}\t${chalk.yellow(
        `(${date})`
      )}\t${chalk.blue(author)}`;

      return { branchRef, description };
    })
  );

  return localBranches.map(({ branchRef, description }) => ({
    name: description,
    value: branchRef,
  }));
}

module.exports = {
  getLocalBranches,
};
