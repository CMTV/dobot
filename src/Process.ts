import Runnable from "./Runnable";
import { cchalk, logRunnableBlock } from "./log";
import { State } from "./State";

export default abstract class Process<TResult = void> extends Runnable<TResult>
{
    abstract do(): Promise<TResult>;

    protected typeCode = 'P';
    protected stage: string;

    async run(): Promise<TResult>
    {
        this.state = State.Running;

        if (this.canPrintLifecycle() && this.canPrintStart())
            this.printStart();

        this.timer.start();

        let error;
        let result: TResult;

        try { result = await Promise.resolve(this.do()); }
        catch (e)
        {
            error = e;
        }

        this.timer.end();

        if (error)
        {
            this.state = State.Failed;
            return this.fail(error);
        }

        this.state = State.Completed;

        if (this.canPrintLifecycle())
            this.printCompleted();

        return result;
    }

    withStage<TReturn = void>(stage: string, func: () => TReturn)
    {
        let oldStage = this.stage;

        this.stage = stage;
        let result = func();
        this.stage = oldStage;

        return result;
    }

    protected fail(e: any): TResult
    {
        this.printFailed();
        return super.fail(e);
    }

    protected canPrintOther()
    {
        return true;
    }

    //#region Print methods

    protected getStagedMsg(msg)
    {
        let lines = [];

        if (this.stage)
            lines.push(cchalk('gray')('Stage:') + ' ' + this.stage);
        
        lines.push(msg);

        return lines;
    }
    
    protected log(toLog: any)
    {
        if (!this.canPrintOther()) return;

        logRunnableBlock(this, this.getStagedMsg(cchalk('gray')(`Process log at ${this.timer.end()}ms`)), 'white');
        console.log(toLog);
        console.log();
    }

    protected warning(toLog: any)
    {
        if (!this.canPrintOther()) return;

        logRunnableBlock(this, this.getStagedMsg(cchalk('gray')(`Process warning at ${this.timer.end()}ms`)), '#db6000');
        console.log(toLog);
        console.log();
    }

    //

    protected printStart()
    {
        logRunnableBlock(this, cchalk('gray')('Process started...'), 'yellow');
    }

    protected printCompleted()
    {
        logRunnableBlock(this, cchalk('gray')(`Process completed in ${this.timer.end()}ms`), 'green');
    }

    protected printFailed()
    {
        logRunnableBlock(this, this.getStagedMsg(cchalk('gray')(`Process failed in ${this.timer.end()}ms`)), 'red');
    }

    //#endregion
}