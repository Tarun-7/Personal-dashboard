class FileProcessingService {

  static parseCSV(text) {
    const lines = text.trim().split(/\r?\n/);
    if (lines.length < 2) return { headers: [], rows: [] };

    const headers = this.csvSplitLine(lines[0]);
    const rows = lines.slice(1).map(line => {
      const values = this.csvSplitLine(line);
      return headers.reduce((obj, h, i) => {
        obj[h.trim()] = values[i]?.trim() || '';
        return obj;
      }, {});
    });

    return { headers, rows };
  }

  static csvSplitLine(line) {
    const result = [];
    let current = '';
    let inQuotes = false;

    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' && (i === 0 || line[i - 1] !== '\\')) {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        result.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current);
    return result;
  }

  static parseKuveraCSV(text) {
    const [headerLine, ...lines] = text.split('\n').filter(Boolean);
    const headers = headerLine.split(',');
    
    return lines.map(line => {
      const vals = line.split(',');
      return headers.reduce(
        (obj, h, idx) => ({
          ...obj,
          [h.trim()]: vals[idx]?.trim(),
        }),
        {}
      );
    });
  }

  static async loadInitialFile(filePath) {
    try {
      const response = await fetch(filePath);
      if (!response.ok) {
        throw new Error(`Failed to fetch ${filePath}`);
      }
      return await response.text();
    } catch (error) {
      console.log(`Could not load initial file ${filePath}:`, error);
      throw error;
    }
  }
}

export default FileProcessingService;
