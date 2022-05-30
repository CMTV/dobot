import Runnable, { TPolicyItem } from "./Runnable";
import Stageable from "./Stageable";
import { BlockColor, chalk, getIndent, logBlock } from "../print";

export default abstract class Stepper<TStepData> extends Runnable
{
    abstract workers: StepperWorker<TStepData>[];

    protected abstract init(): Promise<void>;
    protected abstract hasNext(): Promise<boolean>;
    protected abstract getNext(): Promise<TStepData>;
    protected abstract next(): Promise<void>;

    //

    typeCode = 'S';
    typeName = 'Stepper';

    failedWorker: StepperWorker<TStepData> = null;

    async runAction()
    {
        this.workers.forEach(worker => worker.stepper = this);
        await this.init();

        await Promise.all(this.workers.map(worker => worker.doTarget('init', () => worker.init())));

        while (await this.hasNext())
        {
            let data = await this.getNext();
            await Promise.all(this.workers.map(worker => worker.doTarget('step', () => worker.step(data)))).catch(e => console.log('aboba'));
            await this.next();
        }

        await Promise.all(this.workers.map(worker => worker.doTarget('finish', () => worker.finish())));
    }

    getTreeLog(level: number)
    {
        let log = super.getTreeLog(level);
            log += '\n';

        this.workers.forEach((worker, i) =>
        {
            log += getIndent(level + 1) + chalk().gray('> ') + worker.name;

            if (i !== this.workers.length - 1)
                log += '\n';
        });

        return log;
    }

    protected printFailed(catched: boolean)
    {
        if (!this.failedWorker)
        {
            super.printFailed(catched);
            return;
        }

        this.failedWorker.print('failed', BlockColor.Red);
        this.failedWorker = null;
    }
}

export abstract class StepperWorker<TStepData> extends Stageable
{
    abstract name: string;
    abstract init(): Promise<void>;
    abstract step(data: TStepData): Promise<void>;
    abstract finish(): Promise<void>;

    //

    stepper: Stepper<TStepData>;
    state: string;

    async doTarget(state: string, target: () => Promise<void>)
    {
        this.state = state;
    
        try { await target(); }
        catch (e)
        {
            this.stepper.failedWorker = this;
            throw e;
        }

        this.state = null;
    }

    protected log(toLog)
    {
        if (!this.stepper.canPrint('log'))
            return false;

        this.print('log', BlockColor.Gray);

        console.log(toLog);
        console.log();
    }

    protected warn(toWarn)
    {
        if (!this.stepper.canPrint('warn'))
            return false;

        this.print('warn', BlockColor.Orange);

        console.log(toWarn);
        console.log();
    }

    print(action: string, color: BlockColor)
    {
        let lines = [
            chalk().magentaBright(`Worker ${this.state}:`) + ' ' + this.name,
            ...this.getStageLines(),
            chalk().gray(`Stepper ${action} at ${this.stepper.timer.getCurrent()}ms`)
        ];

        logBlock(this.stepper, lines, color);
    }
}