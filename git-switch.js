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

    const localRefs = refsRaw.map((ref) => {
      const [, commitHash, branchRef] = ref.match(
        /^([a-z0-9]+)\s[^\s]+\srefs\/heads\/(.+)$/
      );

      return { commitHash, branchRef };
    });

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

    const localChoices = localBranches.map(({ branchRef, description }) => ({
      name: description,
      value: branchRef,
    }));

    const remoteOption = {
      name: "(show remote branches)",
      value: Symbol.for("remote"),
    };

    let { branch } = await inquirer.prompt({
      type: "autocomplete",
      name: "branch",
      message: "Type or select a recent local branch from the list",
      emptyText: "Can't find a local GIT branch...",
      source: (answers, input) => {
        input = input || "";

        const filteredOptions = [
          remoteOption,
          ...localChoices.filter(({ value }) =>
            value.match(new RegExp(input, "i"))
          ),
        ];

        return Promise.resolve(filteredOptions);
      },
    });

    if (branch === remoteOption.value) {
      console.log("show remote branches...");
      process.exit(1);
    }

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
