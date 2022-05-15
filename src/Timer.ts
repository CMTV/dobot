export default class Timer
{
    private startTime: number;
    private endTime: number;
    private duration: number;

    start()
    {
        this.startTime = Date.now();
    }

    end()
    {
        this.endTime = Date.now();
        this.duration = this.endTime - this.startTime;

        return this.duration;
    }

    getDuration()
    {
        return this.duration;
    }
}