const util = require("util");
const chalk = require("chalk");
const { formatCommit } = require("./git.js");
const exec = util.promisify(require("child_process").exec);

async function getLocalRefs() {
  const { stdout: result } = await exec(
    'git for-each-ref --sort=-committerdate "refs/heads/"'
  );

  const refsMeta = result.trim().replace(/\t/g, " ").split("\n");

  return refsMeta.map((refMeta) => {
    const [, commitHash, ref] = refMeta.match(
      /^([a-z0-9]+)\s[^\s]+\srefs\/heads\/(.+)$/
    );

    return { commitHash, ref };
  });
}

async function getLocalBranches() {
  const localRefs = await getLocalRefs();

  const localBranches = await Promise.all(
    localRefs.map(async ({ commitHash, ref }) => {
      const description = await formatCommit({ commitHash, ref });
      const branchRef = ref;

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
