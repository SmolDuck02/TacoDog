import { options } from "@/app/api/auth/[...nextauth]/options";
import { getServerSession } from "next-auth";

const BamBam = async () => {
  const data = await getServerSession(options);
  console.log(data);
  return <div></div>;
};

export default BamBam;
