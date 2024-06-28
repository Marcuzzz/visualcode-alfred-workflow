import clipboardy from 'clipboardy';

// Function to replace sensitive data with "loremipsum"
function replaceSensitiveData(text) {
    const patterns = [
        /(["'])password\1\s*:\s*["'].*?["']/gi,
        /(["'])key\1\s*:\s*["'].*?["']/gi,
        /(["'])secret\1\s*:\s*["'].*?["']/gi,
        /(["'])token\1\s*:\s*["'].*?["']/gi,
        /(["'])clientsecret\1\s*:\s*["'].*?["']/gi,
        /(["'])clientid\1\s*:\s*["'].*?["']/gi,
        /(["'])password\1\s*=\s*["'].*?["']/gi,
        /(["'])key\1\s*=\s*["'].*?["']/gi,
        /(["'])secret\1\s*=\s*["'].*?["']/gi,
        /(["'])token\1\s*=\s*["'].*?["']/gi,
        /(["'])clientsecret\1\s*=\s*["'].*?["']/gi,
        /(["'])clientid\1\s*=\s*["'].*?["']/gi,
        /\bpassword\b\s*:\s*['"].*?['"]/gi,
        /\bkey\b\s*:\s*['"].*?['"]/gi,
        /\bsecret\b\s*:\s*['"].*?['"]/gi,
        /\btoken\b\s*:\s*['"].*?['"]/gi,
        /\bclientsecret\b\s*:\s*['"].*?['"]/gi,
        /\bclientid\b\s*:\s*['"].*?['"]/gi,
        /\bpassword\b\s*=\s*['"].*?['"]/gi,
        /\bkey\b\s*=\s*['"].*?['"]/gi,
        /\bsecret\b\s*=\s*['"].*?['"]/gi,
        /\btoken\b\s*=\s*['"].*?['"]/gi,
        /\bclientsecret\b\s*=\s*['"].*?['"]/gi,
        /\bclientid\b\s*=\s*['"].*?['"]/gi
    ];

    patterns.forEach(pattern => {
        text = text.replace(pattern, (match) => {
            const [key, value] = match.split(':');
            return `${key.trim()}: "loremipsum"`;
        });
    });

    return text;
}

// Read clipboard content
clipboardy.read().then((data) => {
    const updatedData = replaceSensitiveData(data);

    // Write updated data back to clipboard
    clipboardy.write(updatedData).then(() => {
        console.log('Updated data copied back to clipboard.');
    }).catch((err) => {
        console.error('Error writing to clipboard:', err);
        process.exit(1);
    });
}).catch((err) => {
    console.error('Error reading from clipboard:', err);
    process.exit(1);
});
