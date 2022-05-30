import Runnable, { TPolicyItem } from "./Runnable";
import { chalk, getIndent } from "../print";

export default abstract class Group extends Runnable
{
    abstract todo(): Runnable[] | Runnable;

    //

    typeCode = 'G';
    typeName = 'Group';

    protected todoCache: Runnable[];

    getTodo(forceGetNew = false)
    {
        if (forceGetNew || !this.todoCache)
        {
            let todo = this.todo();

            if (!Array.isArray(todo))
                todo = [todo];

            this.todoCache = todo;
        }

        return this.todoCache;
    }

    async runAction()
    {
        let isSeries = this instanceof Series;
        let isParallel = this instanceof Parallel;

        if (isParallel)
        {
            await Promise.all(this.getTodo().map(job =>
            {
                job.parent = this.parent;
                return job.run();
            }));
        }
        else
        {
            for (let i = 0; i < this.getTodo().length; i++)
            {
                let job = this.getTodo()[i];
                    job.parent = isSeries ? this.parent : this;
                
                await job.run();
            }
        }
    }

    getTreeLog(level: number)
    {
        let log = super.getTreeLog(level);
            log += '\n';
        
        this.getTodo().forEach((job, i) =>
        {
            log += job.getTreeLog(level + 1);

            if (i !== this.getTodo().length - 1)
                log += '\n';
        });
        
        return log;
    }

    getPrintPolicy()
    {
        let printPolicy = super.getPrintPolicy().filter(policyItem =>
        {
            if (policyItem !== 'throw')
                return true;
            
            return !this.parent;
        });

        return printPolicy;
    }

    protected printCompleted()
    {
        super.printCompleted();

        console.log(this.getTreeLog(0));
        console.log();
    }

    protected printFailed(catched: boolean)
    {
        super.printFailed(catched);

        console.log(this.getTreeLog(0));
        console.log();
    }
}

//
//
//

abstract class SpecialGroup extends Group
{
    jobs: Runnable[];

    constructor(...jobs: Runnable[])
    {
        super();
        this.jobs = jobs;
    }

    todo()
    {
        return this.jobs;
    }

    getTreeLog(level: number)
    {
        let firstLine = [getIndent(level) + this.name];

        let logLines = super.getTreeLog(level).split('\n');
            logLines.shift();

        return firstLine.concat(logLines).join('\n');
    }

    getDefaultPrintPolicy() { return []; }
}

class Series extends SpecialGroup { name = chalk().italic.gray('<series>'); }
class Parallel extends SpecialGroup { name = chalk().italic.gray('<parallel>'); }

//

export function series(...jobs: Runnable[])
{
    return new Series(...jobs);
}

export function parallel(...jobs: Runnable[])
{
    return new Parallel(...jobs);
}