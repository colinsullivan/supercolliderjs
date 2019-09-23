/**
 * Check that scsynth and sclang executables exist.
 *
 * This can be called in a postInstall step for a package
 * to inform the user if it can or cannot find scsynth and sclang.
 *
 * Posts the options to console.
 * Posts errors and any information it can find to help
 * the user.
 */
export default function checkInstall(checkSclang?: boolean, checkScsynth?: boolean): void;
