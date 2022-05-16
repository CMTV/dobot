import chalk from "chalk";
import ProcessGroup from "./ProcessGroup";

import Runnable from "./Runnable";
import { State } from "./State";
import { TodoGroup, TodoGroupType } from "./todo";

export function cchalk(color: string): chalk.Chalk
{
    if (!color)
        return chalk;

    if (color.startsWith('#'))
        return chalk.hex(color);
    
    return chalk[color];
}

export function logRunnableBlock(runnable: Runnable, lines: string | string[], color: string)
{
    let pre = (color: string) => cchalk(color)('█') + ' ';

    console.log(pre(color) + chalk.whiteBright(runnable.getName()));

    if (!Array.isArray(lines))
        lines = [lines];
    
    lines.forEach(line => console.log(pre(color) + line));

    let parentPath = runnable.getParentPath();
    if (parentPath)
        console.log(pre(color) + chalk.gray.italic(parentPath));

    console.log();
}

//

export function getIndent(level: number)
{
    let indentSize = 3;
    return ' '.repeat(indentSize).repeat(level);
}

export function getRunnableState(runnable: Runnable)
{
    let getState = (state: State) =>
    {
        switch (state)
        {
            case State.Completed:
                return chalk.green('[✓]');
            case State.Failed:
                return chalk.red('[X]');
            case State.Running:
                return chalk.yellow('[…]');
            case State.NotRunning:
                return chalk.gray('[ ]');       
        }
    }

    let duration = 0;
    if ([State.Completed, State.Failed].includes(runnable.state))
        duration = runnable.timer.getDuration();

    return chalk.gray('[' + runnable.getTypeCode() + ']') + ' ' + chalk.whiteBright(runnable.getName()) + ' ' + getState(runnable.state) + (duration ? ' ' + chalk.gray(`[${duration}ms]`) : '');
}

//#region Tree

export function printTree(tree: ProcessGroup)
{
    printTreeItem(tree, 0);
    console.log();
}

export function printTreeItem(item: Runnable | TodoGroup, level: number): number
{
    if (item instanceof Runnable)
        printTreeRunnable(item, level);
    
    if (item instanceof TodoGroup)
        printTreeTodoGroup(item, level);

    return level;
}

export function printTreeRunnable(runnable: Runnable, level: number): number
{
    console.log(getIndent(level) + getRunnableState(runnable));

    if (runnable instanceof ProcessGroup)
    {
        level++;
        printTreeTodoGroup(runnable.getTodo(), level, true);
    }

    return level;
}

export function printTreeTodoGroup(todoGroup: TodoGroup, level: number, skipSeries: boolean = false): number
{
    if (todoGroup.type === TodoGroupType.Parallel || !skipSeries)
    {
        console.log(getIndent(level) + chalk.gray.italic(`<${todoGroup.type}>`));
        level++;
    }

    todoGroup.list.forEach(job => printTreeItem(job, level));

    return level;
}

//#endregion