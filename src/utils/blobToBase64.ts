export async function blobToBase64(file: File): Promise<string> {
    const dataUrl = await new Promise<string>((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = (e) => {
            const result = e.target?.result?.toString();
            if (result) {
                resolve(result);
            } else {
                reject(new Error("Error reading file"));
            }
        };
        fileReader.onerror = (_e) => reject(new Error("Error reading file"));
        fileReader.readAsDataURL(file);
    });

    // remove the data url prefix
    const base64 = dataUrl.split(",")[1];

    return base64;
}
