module.exports = {
  calcIndent: function(preamble) {
    // Handle delimeted comments prior to split
    preamble = preamble.replace(/\/\*(.|\n)*?\*\//g, '');

    var lines = preamble.split('\n'),
        lastLine = lines[lines.length - 1];
    return lastLine
        // Single line comments
        .replace(/\/\/.*/, '')
        // Start from operators
        .replace(/.*\S/, '');
  },

  extractRange: function(src, range) {
    if (range[0] >= range[1]) {
      return '';
    }

    // Offset both sides to account for the "(" and ")" chars
    return src.substring(range[0] - 1, range[1] - 1);
  }
};
