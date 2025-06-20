/**
 * Font utility for converting text to small caps style
 */

const smallCapsMap = {
    'a': 'ᴀ', 'b': 'ʙ', 'c': 'ᴄ', 'd': 'ᴅ', 'e': 'ᴇ', 'f': 'ꜰ', 'g': 'ɢ', 'h': 'ʜ',
    'i': 'ɪ', 'j': 'ᴊ', 'k': 'ᴋ', 'l': 'ʟ', 'm': 'ᴍ', 'n': 'ɴ', 'o': 'ᴏ', 'p': 'ᴘ',
    'q': 'ǫ', 'r': 'ʀ', 's': 's', 't': 'ᴛ', 'u': 'ᴜ', 'v': 'ᴠ', 'w': 'ᴡ', 'x': 'x',
    'y': 'ʏ', 'z': 'ᴢ'
}

export const font = {
    /**
     * Convert text to small caps
     * @param {string} text - Text to convert
     * @returns {string} Small caps text
     */
    smallCaps(text) {
        return text.toLowerCase().split('').map(char => smallCapsMap[char] || char).join('')
    },

    /**
     * Convert text to monospace
     * @param {string} text - Text to convert
     * @returns {string} Monospace text
     */
    mono(text) {
        return `\`${text}\``
    },

    /**
     * Convert text to bold
     * @param {string} text - Text to convert
     * @returns {string} Bold text
     */
    bold(text) {
        return `*${text}*`
    },

    /**
     * Convert text to italic
     * @param {string} text - Text to convert
     * @returns {string} Italic text
     */
    italic(text) {
        return `_${text}_`
    }
}

export const convertToSmallCaps = font.smallCaps

export default font
