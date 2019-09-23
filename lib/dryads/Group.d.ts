import { Dryad } from "dryadic";
/**
 * Creates a group on the server; sets .group in context for its children,
 * so any Synths or Groups will be spawned inside this group.
 */
export default class Group extends Dryad {
    /**
     * If there is no SCServer in the parent context,
     * then this will wrap itself in an SCServer
     */
    requireParent(): string;
    prepareForAdd(): object;
    add(): object;
    remove(): object;
}
