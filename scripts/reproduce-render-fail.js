const url = "https://dream-eta-ruddy.vercel.app/api/render/post?headline=UNBELIEVABLE+OFFER%21&subheadline=Limited+time+offer.+Follow+us+for+more+updates.&cta=Order+Now&imgUrl=https%3A%2F%2Fpollinations.ai%2Fp%2FA%2520stylized%252C%2520friendly%25203D%2520character%2520enjoying%2520a%2520meal%2520with%2520a%2520cityscape%2520background%252C%2520surrounded%2520by%2520geometric%2520ribbons%2520and%2520floating%2520badges%2520highlighting%2520the%252060%2525%2520off%2520offer%252C%2520Modern%2520theme%252C%25203D%2520Character%2520Illustration%2520%28stylized%252C%2520friendly%29%252C%2520Stylized%2520Animal%2520Illustration%2520%28rendered%252C%2520near-photorealistic%29%252C%2520Photorealistic%2520%28for%2520architectural%2520elements%29%252C%2520clean%2520professional%25203D%2520render%252C%2520Disney%252FPixar%2520style%2520quality%252C%2520studio%2520lighting%252C%2520vibrant%2520colors%252C%2520centered%2520composition%252C%2520soft%2520shadows%252C%2520solid%2520minimalist%2520background%252C%25201080x1080%2520square%2520format%3Fwidth%3D1080%26height%3D1080%26model%3Dflux%26seed%3D3327&primaryColor=%23E51D2A&accentColor=%23FFD100&businessName=pirch+piyale&logoUrl=https%3A%2F%2Fres.cloudinary.com%2Fdtc1ysrkz%2Fimage%2Fupload%2Fv1767440866%2Fdream-app%2Flogos%2Fcmjvlvurx0001drjzbkswyo9o%2Fwar9fivnv42tdfd3qcpp.jpg&layout=poster&geometry=cards&illustrationSubject=A+stylized%2C+friendly+3D+character+enjoying+a+meal+with+a+cityscape+background%2C+surrounded+by+geometric+ribbons+and+floating+badges+highlighting+the+60%25+off+offer";

async function test() {
    console.log("Fetching URL:", url);
    const start = Date.now();
    try {
        const res = await fetch(url);
        const end = Date.now();
        console.log("Status:", res.status);
        console.log("Content-Type:", res.headers.get("content-type"));
        console.log("Content-Length:", res.headers.get("content-length"));
        console.log("Duration:", end - start, "ms");

        const body = await res.arrayBuffer();
        console.log("Body Size:", body.byteLength, "bytes");

        if (body.byteLength === 0) {
            console.error("FAILURE: Received empty body!");
        } else if (res.status !== 200) {
            console.error("Error Status:", res.status);
        } else {
            console.log("SUCCESS: Received", body.byteLength, "bytes");
        }
    } catch (err) {
        console.error("Fetch Exception:", err.message);
    }
}

test();
