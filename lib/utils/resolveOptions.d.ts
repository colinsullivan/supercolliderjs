import { ServerOptions } from "../server/options";
/**
 * load configuration files
 * and merge options into a final dict
 *
 * @param {String} configPath - explicit path to a yaml config file
 *           otherwise tries
 *             .supercollider.yaml
 *             ~/.supercollider.yaml
 *
 * @param {object} commandLineOptions -
 *            a dict of options to be merged over the loaded config.
 *            eg. supplied command line options --sclang=/some/path/to/sclang
 *
 */
export default function resolveOptions(configPath?: string | null, commandLineOptions?: object): Promise<ServerOptions>;
