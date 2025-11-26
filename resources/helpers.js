//
// Time
//

/**
 * Alias for Date.now(). To be used as the default timestamp function.
 * @returns {number} The number of milliseconds elapsed since epoch.
 */
export const nowEpoch = () => Date.now();
/**
 * Convert the timestamp to its ISO 8601 representation.
 * If no parameter is provided as input, the current time will be used.
 * @param {number} [time] - (optional) The number of milliseconds since epoch.
 * @returns {string}
 */
export const nowEpoch2ISO = (time) => time ? new Date(time).toISOString() : nowEpoch2ISO(nowEpoch());
/**
 * Convert the ISO 8601 representation to its timestamp.
 * If no parameter is provided as input, the current time will be used.
 * @param {string} [time] - (optional) The ISO representation of a timestamp.
 * @returns {number}
 */
export const nowISO2Epoch = (time) => time ? Date.parse(time) : nowEpoch();
/**
 * Return either the current elapsed milliseconds since epoch (timestamp), or converts in both directions: a timestamp with its ISO 8601 representation.
 * @param {(string|number)} [time] - Value to be converted between the timestamp as a number and its ISO 8601 representation as a string.
 * @returns {(string|number)}
 */
export function now(time) {
    if (typeof time === "null" || typeof time === "undefined") {
        return nowEpoch();
    } else if (typeof time === "number") {
        return nowEpoch2ISO(time);
    } else if (typeof time === "string") {
        return nowISO2Epoch(time);
    }
}



//
// Logging
//

const consoleBase = (type, ...msg) => [`[${nowEpoch2ISO()}] <${type}>`, ...msg];
export const log = (...msg) => console.log(...consoleBase("LOG", ...msg));
export const info = (...msg) => console.info(...consoleBase("INF", ...msg));
export const warn = (...msg) => console.warn(...consoleBase("WARN", ...msg));
export const error = (...msg) => console.error(...consoleBase("ERR", ...msg));
export const debug = (...msg) => console.debug(...consoleBase("DEBUG", ...msg));
export const trace = (...msg) => console.trace(...consoleBase("TRACE", ...msg));



//
// String related
//

/**
 * Convert any basic data type to string.
 * @param {*} obj - input to convert to string, whatever basic data type it is
 * @param {*} indent - in case of an object, the number of spaces to indent using JSON.stringify
 * @returns 
 */
export function toStr(obj, indent) {
    if (typeof (obj) === "object") {
        const indentDefault = 2;
        const indentFinal = typeof (indent) === "number" && indent >= 0 ? indent : indentDefault;
        return JSON.stringify(obj, null, indentFinal);
    } else {
        return `${obj}`;
    }
}
