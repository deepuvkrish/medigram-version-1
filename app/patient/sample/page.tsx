import type { Metadata } from "next";

export const metadata: Metadata = { title: "Sample Page" };

export default function Page() {
  return (
    <div className="flex flex-col w-full h-full justify-center items-center">
      <div className="loader"></div>

      <div className="loaderText">
        <label>Please wait...</label>
        <div className="loading"></div>
      </div>
    </div>
  );
}
