import Runnable from "./Runnable";

export default abstract class Process extends Runnable
{
    abstract do(): Promise<void>;

    //

    typeCode = 'P';
    typeName = 'Process';

    async runAction()
    {
        await this.do();
    }
}