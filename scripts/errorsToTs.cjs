const fs = require("fs").promises;

(async () => {
    const filePath = process.argv[2]; // grab the file path from the command-line arguments

    if (!filePath) {
        console.error("Please provide a file path.");
        process.exit(1);
    }

    let file;

    try {
        file = await fs.readFile(filePath, "utf-8");
    } catch (error) {
        console.error(`Failed to read file at path: ${filePath}`);
        console.error(error);
        process.exit(1);
    }

    const regex = /#\s*\[error\(\s*"([^"]*)"\s*\)\]/g;

    let matches = file.match(regex);

    if (matches) {
        let errors = matches.map((match) => match.match(/"(.*?)"/)[1]); // capture text within ""
        let typeScriptTypeString = `type MutinyError = "${errors.join(
            '"\n\t| "'
        )}";`;

        console.log(typeScriptTypeString);
    } else {
        console.error("No matches found in the provided file.");
    }
})();
