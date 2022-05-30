import Stageable from "./Stageable";
import Timer from "../Timer";
import { State, stateToStr } from "../state";
import { BlockColor, chalk, getIndent, logBlock } from "../print";

export type TPolicyItem = 'start' | 'fail' | 'throw' | 'complete' | 'log' | 'warn';

export default abstract class Runnable extends Stageable
{
    abstract typeCode:          string;
    abstract typeName:          string;
    abstract name:              string;
    abstract runAction():       Promise<void>;

    //

    state: State = State.NotRunning;
    timer: Timer = new Timer;
    parent?: Runnable;

    //

    async run()
    {
        if (this.canPrint('start'))
            this.printStart();
        
        this.state = State.Running;
        this.timer.start();

        let error;

        try { await this.runAction(); }
        catch (e) { error = e; }

        this.timer.end();

        if (error)
        {
            this.state = State.Failed;

            this.fail(error);

            if (this.canPrint('fail'))
                this.printFailed(true);

            return;
        }

        this.state = State.Completed;
        
        if (this.canPrint('complete'))
            this.printCompleted();
    }

    reset()
    {
        this.state = State.NotRunning;
    }

    getTreeLog(level: number)
    {
        let duration = 0;
        if ([State.Completed, State.Failed].includes(this.state))
            duration = this.timer.getFullDuration();

        return  getIndent(level) + chalk().gray(`[${this.typeCode}]`) + ' ' + chalk().whiteBright(this.name) + ' ' + chalk().gray(`[${stateToStr(this.state)}]`) + (duration ? chalk().gray(` [${duration}ms]`) : '');
    }

    protected fail(e)
    {
        if (this.canPrint('throw'))
            this.printFailed(false);

        throw e;
    }

    //#region Print methods
    //
    //

    getPrintPolicy(): TPolicyItem[]
    {
        if (this.parent)
            return ['throw', 'log', 'warn'];
        
        return ['start', 'fail', 'throw', 'complete', 'log', 'warn'];
    }

    canPrint(policyItem: TPolicyItem): boolean
    {
        return this.getPrintPolicy().includes(policyItem);
    }

    protected filterPrintLines(lines: string[], policyItem: TPolicyItem): string[]
    {
        if (['complete', 'fail'].includes(policyItem))
            return lines;

        return this.getStageLines().concat(lines);
    }

    //

    protected printStart()
    {
        let lines = [chalk().gray(`${this.typeName} started...`)];
            lines = this.filterPrintLines(lines, 'start');

        logBlock(this, lines, BlockColor.Yellow);
    }

    protected printCompleted()
    {
        let lines = [chalk().gray(`${this.typeName} completed in ${this.timer.getFullDuration()}ms`)];
            lines = this.filterPrintLines(lines, 'complete');

        logBlock(this, lines, BlockColor.Green);
    }

    protected printFailed(catched: boolean)
    {
        let lines = [chalk().gray(`${this.typeName} failed in ${this.timer.getFullDuration()}ms`)];
            lines = this.filterPrintLines(lines, catched ? 'fail' : 'throw');

        logBlock(this, lines, BlockColor.Red);
    }

    //

    protected log(toLog)
    {
        if (!this.canPrint('log'))
            return false;
        
        let lines = [chalk().gray(`${this.typeName} log at ${this.timer.getCurrent()}ms`)];
            lines = this.filterPrintLines(lines, 'log');

        logBlock(this, lines, BlockColor.Gray);
        console.log(toLog);
        console.log();
    }

    protected warn(toWarn)
    {
        if (!this.canPrint('warn'))
            return false;

        let lines = [chalk().gray(`${this.typeName} warn at ${this.timer.getCurrent()}ms`)];
            lines = this.filterPrintLines(lines, 'warn');

        logBlock(this, lines, BlockColor.Orange);
        console.log(toWarn);
        console.log();
    }

    //
    //
    //#endregion
}