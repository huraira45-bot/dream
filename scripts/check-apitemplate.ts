import { config } from 'dotenv';
config();

const API_KEY = process.env.APITEMPLATE_API_KEY;
const API_URL = "https://api.apitemplate.io/v1/list-templates";

async function listTemplates() {
    if (!API_KEY) {
        console.error("APITEMPLATE_API_KEY missing");
        return;
    }

    try {
        const response = await fetch(API_URL, {
            method: "GET",
            headers: {
                "X-API-KEY": API_KEY,
                "Content-Type": "application/json"
            }
        });

        const text = await response.text();
        console.log("Raw Response:", text);

        if (!response.ok) {
            console.error(`Status ${response.status}: ${text}`);
            return;
        }

        try {
            const data = JSON.parse(text);
            console.log("Templates Found:", JSON.stringify(data, null, 2));
        } catch (e) {
            console.log("Response is not JSON.");
        }
    } catch (error) {
        console.error("Fetch Error:", error);
    }
}

listTemplates();
