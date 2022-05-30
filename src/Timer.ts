export default class Timer
{
    private startTime: number;
    private endTime: number;

    start()
    {
        this.startTime = performance.now();
    }

    end()
    {
        this.endTime = performance.now();
    }

    //

    getCurrent()
    {
        return Math.round(performance.now() - this.startTime);
    }

    getFullDuration()
    {
        return Math.round(this.endTime - this.startTime);
    }
}