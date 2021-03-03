const util = require("util");
const chalk = require("chalk");
const exec = util.promisify(require("child_process").exec);

async function formatCommit({ commitHash, ref }) {
  const { stdout: result } = await exec(
    `git log -1 --pretty="%ar\t%cn" ${commitHash}`
  );
  const [date, author] = result.trim().split("\t");

  return `${chalk.green(ref)}\t${chalk.yellow(`(${date})`)}\t${chalk.blue(
    author
  )}`;
}

module.exports = {
  formatCommit,
};
