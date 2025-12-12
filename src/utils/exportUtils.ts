/**
 * Exports an array of objects to a CSV file.
 * @param data Array of objects to export
 * @param filename Name of the file to download (without extension)
 */
export function exportToCsv<T extends object>(data: T[], filename: string) {
    if (!data || !data.length) {
        console.warn('No data to export');
        return;
    }

    // Get headers from the first object
    const headers = Object.keys(data[0]);

    // Create CSV content
    const csvContent = [
        headers.join(','), // Header row
        ...data.map(row =>
            headers.map(header => {
                const value = (row as any)[header];
                // Handle special characters and quotes
                const stringValue = value === null || value === undefined ? '' : String(value);
                const escapedValue = stringValue.replace(/"/g, '""');
                return `"${escapedValue}"`;
            }).join(',')
        )
    ].join('\n');

    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${filename}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}
