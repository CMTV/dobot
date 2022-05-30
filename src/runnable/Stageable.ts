import { chalk, getIndent } from "../print";

export type TStageMeta = { [label: string]: any };

export class Stage
{
    message: string;
    meta?: TStageMeta;
    blocking: boolean;
}

export default class Stageable
{
    protected stageStack: Stage[] = [];
    
    getStage()
    {
        return this.stageStack.at(-1);
    }

    getStageLines(): string[]
    {
        let stage = this.getStage();

        if (!stage)
            return [];

        let lines = [chalk().gray('Stage:') + ' ' + stage.message];

        if (stage.meta)
            Object.keys(stage.meta).forEach(label => lines.push(getIndent() + chalk().gray(label + ':') + ' ' + stage.meta[label]));

        return lines;
    }

    startStage(message: string, meta: TStageMeta = null)
    {
        let stage = new Stage;
            stage.message = message;
            
            if (meta)
                stage.meta = meta;

        this.stageStack.push(stage);
    }

    stopStage()
    {
        let lastStage = this.getStage();

        if (!lastStage || lastStage.blocking)
            return;
            
        this.stageStack.pop();
    }

    withStage(func: () => void, message: string, meta: TStageMeta = null)
    {
        let stage = new Stage;
            stage.message = message;
            stage.blocking = true;
            
            if (meta)
                stage.meta = meta;

        this.stageStack.push(stage);

        let index = this.stageStack.length - 1;

        func();

        {
            let i = this.stageStack.length - index;
            while (i > 0)
            {
                this.stageStack.pop();
                i--;
            }
        }
    }
}