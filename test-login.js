async function test() {
  const wpUrl = "https://dreampcbuild.com";
  const user = "niel";
  const pass = "rbop 4dRy ZFzk pHg6 hXMM GmF6";
  const auth = Buffer.from(user + ":" + pass).toString("base64");

  const res = await fetch(`${wpUrl}/wp-json/wp/v2/users/me?context=edit`, {
    headers: { Authorization: `Basic ${auth}` }
  });

  console.log("Status:", res.status);
  const json = await res.json();
  console.log("Body:", JSON.stringify(json, null, 2));
}

test();
