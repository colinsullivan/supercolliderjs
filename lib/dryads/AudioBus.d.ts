import { Dryad } from "dryadic";
interface Properties {
    numChannels: number;
}
/**
 * Allocates an audio bus, making it available in the children's context as .out (integer)
 * and .numChannels (integer)
 */
export default class AudioBus extends Dryad<Properties> {
    defaultProperties(): Properties;
    /**
     * If there is no SCServer in the parent context,
     * then this will wrap itself in an SCServer
     */
    requireParent(): string;
    prepareForAdd(): object;
    remove(): object;
}
export {};
