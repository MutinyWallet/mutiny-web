// https://stackoverflow.com/questions/34156282/how-do-i-save-json-to-local-text-file

export function downloadTextFile(
    content: string,
    fileName: string,
    type?: string
) {
    const contentType = type ? type : "application/json";
    const a = document.createElement("a");
    const file = new Blob([content], { type: contentType });
    a.href = URL.createObjectURL(file);
    a.download = fileName;
    a.click();
}
