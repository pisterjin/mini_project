import { api } from "./axios";

export async function signup(data) {
  const res = await api.post("/register", data);

  return data;

  //   try {
  //     const res = await api.post("http://localhost:5000/register", data);
  //     console.log(res.data);
  //   } catch (err) {
  //     console.error(err);
  //   }
}
