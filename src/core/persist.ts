import "reflect-metadata";
import "@nivinjoseph/n-ext";
import { given } from "@nivinjoseph/n-defensive";


export const persistSymbol = Symbol("persist");

// public
export function persist(target: Function): void
{
    given(target, "target").ensureHasValue().ensureIsFunction();
    
    Reflect.defineMetadata(persistSymbol, true, target);
}