import axios from "axios";

export async function loginWithEmailPassword(
  email: string,
  password: string,
  extraParams: Record<string, string> = {}
) {
  try {
    const response = await axios.post(
      `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN_V2}/oauth/token`,
      {
        grant_type: "password",
        username: email,
        password: password,
        audience: process.env.NEXT_PUBLIC_AUTH0_AUDIENCE_V2,
        scope: "",
        client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID_V2,
        client_secret: process.env.NEXT_PUBLIC_AUTH0_CLIENT_SECRET_V2,
        ...extraParams,
      }
    );

    console.log("✅ Authenticated successfully!");
    //console.log(response);
    console.log(response.data);
    return response.data;
  } catch (error: any) {
    console.error(
      "❌ Authentication failed:",
      error.response?.data || error.message
    );
    throw error;
  }
}
