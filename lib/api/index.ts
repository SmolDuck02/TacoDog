type ResponseObject = {
  response: string;
};

const backendURL = "https://web-production-019a.up.railway.app";

export default async function askMe(userMessage: string): Promise<ResponseObject> {
  console.log(userMessage);
  const response = await fetch(`${backendURL}/ask`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ userMessage }),
  });

  if (!response.ok) {
    return { response: "error" };
  }

  const data: ResponseObject = await response.json();
  return data;
}
