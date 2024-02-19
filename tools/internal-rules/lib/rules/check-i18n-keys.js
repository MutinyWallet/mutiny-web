"use strict";

const fs = require("fs");
const path = require("path");
const { parse } = require("@babel/parser");

module.exports = {
    meta: {
        name: "check-i18n-keys",
        type: "suggestion",
        docs: {
            description:
                "Ensure translation keys in other language files match the keys in the English translation file.",
            category: "Best Practices",
            recommended: true
        },
        fixable: null,
        schema: []
    },
    create: function (context) {
        function extractKeys(node, parentKey = "") {
            const keys = [];
            let properties = node.properties;

            if (typeof node === "string") {
                const fileContent = fs.readFileSync(node, "utf8");
                const ast = parse(fileContent, {
                    sourceType: "module",
                    plugins: ["typescript", "jsx"]
                });
                properties =
                    !!ast && ast.program.body[0].declaration.properties;
            }

            function traverseProperties(properties, parentKey) {
                properties.forEach((property) => {
                    if (
                        (property.type === "ObjectProperty" ||
                        property.type === "Property") &&
                            property.key.type === "Identifier"
                    ) {
                        const currentKey = parentKey
                            ? `${parentKey}.${property.key.name}`
                            : property.key.name;
                        keys.push(currentKey);
                        if (property.value.type === "ObjectExpression") {
                            traverseProperties(
                                property.value.properties,
                                currentKey
                            );
                        }
                    }
                });
            }

            traverseProperties(properties, parentKey);

            return keys;
        }

        return {
            Program(node) {
                for (const statement of node.body) {
                    const fallbackFilePath = path
                        .relative(process.cwd(), context.getFilename())
                        .replace(
                            /\/i18n\/\w+\/translations\.ts$/,
                            "/i18n/en/translations.ts"
                        );

                    const keys = extractKeys(statement.declaration);

                    const enKeys = extractKeys(fallbackFilePath);

                    // Report missing keys
                    enKeys.forEach((enKey) => {
                        if (!keys.includes(enKey)) {
                            context.report({
                                node: node,
                                message: `missing key '${enKey}'`
                            });
                        }
                    });

                    // Report extra keys
                    keys.forEach((key) => {
                        if (!enKeys.includes(key)) {
                            context.report({
                                node: node,
                                message: `extra key '${key}'`
                            });
                        }
                    });
                }
            }
        };
    }
};
