#!/usr/bin/env node

const util = require("util");
const exec = util.promisify(require("child_process").exec);
const inquirer = require("inquirer");
const chalk = require("chalk");

inquirer.registerPrompt(
  "autocomplete",
  require("inquirer-autocomplete-prompt")
);

(async () => {
  try {
    const { stdout: refsResult } = await exec(
      'git for-each-ref --sort=-committerdate "refs/heads/"'
    );
    const refsRaw = refsResult.trim().replace(/\t/g, " ").split("\n");

    const refs = refsRaw.map((ref) => {
      const [, commitHash, branchRef] = ref.match(
        /^([a-z0-9]+)\s[^\s]+\srefs\/heads\/(.+)$/
      );

      return { commitHash, branchRef };
    });

    const branches = await Promise.all(
      refs.map(async ({ commitHash, branchRef }) => {
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

    const choices = branches.map(({ branchRef, description }) => ({
      name: description,
      value: branchRef,
    }));

    const { branch } = await inquirer.prompt({
      type: "autocomplete",
      name: "branch",
      message: "Type or select recent branch from the list",
      source: (answers, input) => {
        input = input || "";

        return Promise.resolve(
          choices.filter(({ value }) => value.match(new RegExp(input, "i")))
        );
      },
    });

    if (!branch) {
      process.exit();
    }

    const { stdout: gitResult, stderr: error } = await exec(`git co ${branch}`);

    console.log(`${chalk.bold("Branch switched to:")} ${chalk.green(branch)}`);
  } catch (error) {
    console.log(
      `${chalk.bold("Ups. Cannot switch to branch due error:")}\n\n${chalk.red(
        error
      )}`
    );
    process.exit(1);
  }
})();
