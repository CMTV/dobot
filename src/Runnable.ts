import { State } from "./State";
import Timer from "./Timer";

export default abstract class Runnable<TResult = any>
{
    abstract run(): Promise<TResult>;
    
    protected abstract typeCode: string;    
    protected abstract name: string | (() => string);
    
    state:      State = State.NotRunning;
    parent?:    Runnable = null;
    timer:      Timer = new Timer;

    getTypeCode() { return this.typeCode; }

    getName()
    {
        if (!this.name)
            return this.constructor.name;
        
        return (typeof this.name === 'string' ? this.name : this.name());
    }

    getParentPath()
    {
        let parents = [];
        let parent = this;

        while (parent = parent.parent as any)
            parents.push(parent);

        return parents.reverse().map(item => item.getName()).join(' → ');
    }

    reset()
    {
        this.state = State.NotRunning;
    }

    protected fail(e): TResult
    {
        throw e;
    }

    protected canPrintLifecycle(): boolean
    {
        if (this.parent)
            return false;

        return true;
    }

    protected canPrintStart(): boolean
    {
        return true;
    }
}