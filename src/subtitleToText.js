const { readFile, writeFile } = require("fs").promises;
const path = require("path");

// Read the SRT file
const readSrtFile = async (filePath) => await readFile(filePath, "utf-8");

// Parse the SRT content into text, keeping line breaks only after periods
const parseSrtToText = (content) => {
    const lines = content.split("\n");

    // Filter out numbers and timestamps
    const filteredLines = lines.filter((line) => {
        const trimmed = line.trim();
        return trimmed && !/^\d+$/.test(trimmed) && !/-->/g.test(trimmed);
    });

    // Join all lines into a single string with spaces
    const singleLineText = filteredLines.join(" ");

    // Replace multiple spaces with a single space
    const normalizedText = singleLineText.replace(/\s+/g, " ").trim();

    // Insert newline only after periods
    const formattedText = normalizedText.replace(/\. /g, ".\n");

    return formattedText;
};

// Write the TXT file
const writeTxtFile = async (filePath, content) => await writeFile(filePath, content, "utf-8");

// Main function
const srtToTxt = async (inputFile) => {
    const outputFile = path.basename(inputFile, path.extname(inputFile)) + ".txt";
    const content = await readSrtFile(inputFile);
    const text = parseSrtToText(content);
    await writeTxtFile(`output/${outputFile}`, text);
    console.log(`Successfully converted to: ${outputFile}`);
};

// Get the input file from command line arguments
const inputFile = process.argv[2];

if (!inputFile) {
    console.error("Please provide the SRT file as an argument. Example: npm run srtToTxt input/sample.srt");
    process.exit(1);
}

// Execute conversion and handle errors
srtToTxt(inputFile).catch((err) => console.error("Error during conversion:", err));
