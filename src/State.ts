import { BlockColor, chalk } from "./print";

export enum State
{
    NotRunning =    'notRunning',
    Running =       'running',
    Failed =        'failed',
    Completed =     'completed'
}

export function stateToStr(state: State)
{
    switch (state)
    {
        case State.NotRunning:
            return ' ';

        case State.Running:
            return chalk(BlockColor.Yellow)('…');

        case State.Failed:
            return chalk(BlockColor.Red)('X');

        case State.Completed:
            return chalk(BlockColor.Green)('✓');
    }
}