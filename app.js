import clipboardy from 'clipboardy';

// Define the regex pattern
const regex = /(secret|token|clientSecret|client)(?!.*token_uri|clientId|client_uri)\s*['"]?\s*[:=]\s*['"]?(.*?)(['"]?\s*,|\n|$)/gm;

function replacer(line, option) {
    return line.replace(regex, (match, key, value, ending) => {
        if (option === 'a') {
            return `${key} = #########${ending}`;
        } else if (option === 'b') {
            return `${key}" : "#########${ending}`;   
        } else {
            return `${key}' : '#########${ending}`;
        }
    });
}

// Read clipboard content
clipboardy.read().then((data) => {
    // Split data into lines and process each line
    const lines = data.split('\n');
    const updatedLines = lines.map(line => {
        if (line.includes('=')) {
            line = replacer(line, "a");
        } else if (line.includes('"')) {
            line = replacer(line, "b");
        } else {
            line = replacer(line, "c");
        }
        return line;
    });

    // Join the updated lines back into a single string
    const result = updatedLines.join('\n');

    // Write updated data back to clipboard
    clipboardy.write(result).then(() => {
        console.log('Updated data copied back to clipboard.');
    }).catch((err) => {
        console.error('Error writing to clipboard:', err);
        process.exit(1);
    });
}).catch((err) => {
    console.error('Error reading from clipboard:', err);
    process.exit(1);
});
