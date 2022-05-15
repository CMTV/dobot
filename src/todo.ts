import Runnable from "./Runnable";

export enum TodoGroupType
{
    Series = 'series',
    Parallel = 'parallel'
}

export type TList = (Runnable | TodoGroup)[];

export class TodoGroup
{
    type: TodoGroupType;
    list: TList;
}

function makeTodoGroup(type: TodoGroupType, ...items: TList)
{
    let todoGroup = new TodoGroup;
        todoGroup.type = type;
        todoGroup.list = items;

    return todoGroup;
}

export function series(...items: TList)
{
    return makeTodoGroup(TodoGroupType.Series, ...items);
}

export function parallel(...items: TList)
{
    return makeTodoGroup(TodoGroupType.Parallel, ...items);
}