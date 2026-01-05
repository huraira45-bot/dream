const fs = require('fs');
const path = require('path');

// Manually parse .env to get the key
function getEnvVar(name) {
    const files = ['.env', '.env.local', '.env.development'];
    for (const file of files) {
        try {
            const envPath = path.join(__dirname, '..', file);
            if (!fs.existsSync(envPath)) continue;
            const content = fs.readFileSync(envPath, 'utf8');
            const lines = content.split('\n');
            for (const line of lines) {
                if (line.trim().startsWith(`${name}=`)) {
                    return line.split('=')[1].trim().replace(/^["']|["']$/g, '');
                }
            }
        } catch (e) {
            console.error(`Error reading ${file}:`, e);
        }
    }
    return null;
}

const API_KEY = getEnvVar('APITEMPLATE_API_KEY');
const API_URL = "https://rest.apitemplate.io/v2/list-templates";

async function listTemplates() {
    if (!API_KEY) {
        console.error("APITEMPLATE_API_KEY missing in all env files");
        return;
    }

    console.log("Checking APITemplate.io v2 with key:", API_KEY.substring(0, 5) + "...");

    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "X-API-KEY": API_KEY,
                "Content-Type": "application/json"
            }
        });

        const text = await response.text();
        if (!response.ok) {
            console.error(`Status ${response.status}: ${text}`);
            return;
        }

        try {
            const data = JSON.parse(text);
            console.log("Templates Found:");
            if (data.templates) {
                data.templates.forEach(t => {
                    console.log(`- ID: ${t.template_id}, Name: ${t.name}`);
                });
            } else {
                console.log(JSON.stringify(data, null, 2));
            }
        } catch (e) {
            console.log("Response is not JSON.");
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

listTemplates();
