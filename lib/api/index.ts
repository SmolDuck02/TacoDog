type ResponseObject = {
  response: string;
};

export default async function askMe(userMessage: string): Promise<ResponseObject> {
  console.log(userMessage);
  const response = await fetch("http://127.0.0.1:8000/ask/", {
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
