import chalk from 'chalk';
import { $ } from 'zx';

export async function formatCommit({ commitHash, ref }) {
    const result = await $`git log -1 --pretty="%ar\t%cn" ${commitHash}`;
    const [date, author] = result.toString().trim().split('\t');

    return `${chalk.green(ref)}\t${chalk.yellow(`(${date})`)}\t${chalk.blue(
        author,
    )}`;
}
