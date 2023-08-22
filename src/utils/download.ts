import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Toast } from "@capacitor/toast";

export async function downloadTextFile(
    content: string,
    fileName: string,
    type?: string
) {
    const contentType = type ? type : "application/json";

    if (Capacitor.isNativePlatform()) {
        try {
            const writeFileResult = await Filesystem.writeFile({
                path: `${fileName}`,
                data: content,
                directory: Directory.Documents,
                encoding: Encoding.UTF8
            });

            await Toast.show({
                text: `Saved to ${writeFileResult.uri}`,
                duration: "long"
            });
        } catch (err) {
            console.error("Error writing the file:", err);
            await Toast.show({
                text: `Error while saving file`,
                duration: "long"
            });
        }
    } else {
        // https://stackoverflow.com/questions/34156282/how-do-i-save-json-to-local-text-file
        const a = document.createElement("a");
        const file = new Blob([content], { type: contentType });
        a.href = URL.createObjectURL(file);
        a.download = fileName;
        a.click();
    }
}
