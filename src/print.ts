import Color from "color";
import npmChalk from "chalk";
import Runnable from "./runnable/Runnable";

export function chalk(color: string = null): npmChalk.Chalk
{
    if (!color)
        return npmChalk;

    if (color.startsWith('#'))
        return npmChalk.hex(color);

    return npmChalk[color];
}

export function getIndent(level: number = 1)
{
    let indentSize = 3;
    return ' '.repeat(indentSize).repeat(level);
}

export function logBlock(runnable: Runnable, lines: string[] | string, hexColor: string)
{
    let baseColor = hexColor;
    let secondaryColor = new Color(baseColor).darken(.35).hex();
    let typeCodeColor = '#ffffff' // new Color(baseColor).isDark() ? '#ffffff' : '#000000';

    console.log(chalk().bgHex(baseColor).hex(typeCodeColor).bold(` ${runnable.typeCode} `) + ' ' + chalk().whiteBright.bold(runnable.name));
 
    if (!Array.isArray(lines))
        lines = [lines];
 
    lines.forEach(line => console.log(' ' + chalk().bgHex(secondaryColor)(' ') + '  ' + line));
    
    console.log();
}

export enum BlockColor
{
    Gray =      '#757575',
    Red =       '#d72525',
    Orange =    '#db6000',
    Yellow =    '#bea900',
    Green =     '#528936'
}