import { Capacitor } from "@capacitor/core";
import { Directory, Encoding, Filesystem } from "@capacitor/filesystem";
import { Share } from "@capacitor/share";
import { Toast } from "@capacitor/toast";

import { eify } from "./eify";

export async function downloadTextFile(
    content: string,
    fileName: string,
    type?: string
) {
    const contentType = type ? type : "application/json";

    if (Capacitor.isNativePlatform()) {
        try {
            const fileConfig = {
                path: `Exports/${fileName}`,
                data: content,
                directory: Directory.Cache,
                encoding: Encoding.UTF8,
                recursive: true
            };
            const writeFileResult = await Filesystem.writeFile(fileConfig);

            // Share the file
            // This is because we save to the cache to get around reinstall issues
            // with file storage permissions.
            await Share.share({ url: writeFileResult.uri });

            await Toast.show({
                text: `File shared successfully`,
                duration: "long"
            });
        } catch (error) {
            console.error(
                "Error creating or sharing the file: ",
                JSON.stringify(error)
            );

            const err = eify(error);

            if (err.message.includes("Share canceled")) {
                // Do nothing
                return;
            } else {
                await Toast.show({
                    text: `Error while saving or sharing file`,
                    duration: "long"
                });
            }
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
