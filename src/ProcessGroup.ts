import { cchalk, logRunnableBlock, printTree } from "./log";

import Runnable from "./Runnable";
import { State } from "./State";
import { series, TList, TodoGroup, TodoGroupType } from "./todo";

export default abstract class ProcessGroup extends Runnable
{
    abstract todo(): TodoGroup | TList;

    protected typeCode = 'G';

    private todoCache: TodoGroup;

    getTodo()
    {
        let todoGroup = this.todoCache ?? this.todo();
            todoGroup = Array.isArray(todoGroup) ? series(...todoGroup) : todoGroup;

        this.todoCache = todoGroup;

        return this.todoCache;
    }

    async run()
    {
        this.state = State.Running;

        if (this.canPrintLifecycle() && this.canPrintStart())
            this.printStart();

        this.timer.start();

        let todoGroup = this.getTodo();

        let error;

        try { await this.runTodoGroup(todoGroup); }
        catch (e)
        {
            error = e;
        }

        this.timer.end();

        if (error)
        {
            this.state = State.Failed;

            if (this.canPrintLifecycle())
            {
                this.printFailed();
                printTree(this);
            }

            this.fail(error);
            return;
        }

        this.state = State.Completed;

        if (this.canPrintLifecycle())
        {
            this.printCompleted();
            printTree(this);
        }
    }

    protected async runTodoGroup(todoGroup: TodoGroup)
    {
        let isParallel = todoGroup.type === TodoGroupType.Parallel;

        if (isParallel)
        {
            await Promise.all(todoGroup.list.map(job =>
            {
                if (job instanceof Runnable)
                {
                    job.parent = this;
                    return job.run();
                }

                return this.runTodoGroup(job);
            }));
        }
        else
        {
            for (let i = 0; i < todoGroup.list.length; i++)
            {
                let job = todoGroup.list[i];

                if (job instanceof Runnable)
                {
                    job.parent = this;
                    await job.run();
                }
                else
                {
                    await this.runTodoGroup(job);
                }
            }
        }
    }

    //#region Print methods

    protected printStart()
    {
        logRunnableBlock(this, cchalk('gray')('Group started...'), 'yellow');
    }

    protected printFailed()
    {
        logRunnableBlock(this, cchalk('gray')(`Group failed in ${this.timer.end()}ms`), 'red');
    }

    protected printCompleted()
    {
        logRunnableBlock(this, cchalk('gray')(`Group completed in ${this.timer.end()}ms`), 'green');
    }

    //#endregion
}