import { Data, useDatabase } from "@/components/DataContext";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

const Home = () => {
  const router = useRouter();
  const onClickRecord = useCallback(() => {
    router.push("/recorder");
  }, [router]);

  const [recordings, setRecordings] = useState<Data[]>([]);

  const { getAll } = useDatabase();

  useEffect(() => {
    setRecordings(getAll());
  }, [getAll]);

  return (
    <div className="h-screen bg-[#F6F6F9] relative flex">
      <div className="flex flex-col gap-[13px] overflow-y-scroll p-[16px] w-full">
        {recordings.map((recording) => {
          const { id, text, createdAt } = recording;
          const createdAtString = new Date(createdAt).toLocaleString();
          return (
            <div
              key={id}
              className="h-[96px] bg-[#FFFFFF] flex flex-row items-center px-[14px] py-[18px] rounded-[10px]"
              onClick={() => {
                router.push(`/recording/${id}`);
              }}
            >
              <div className="mr-[14px]">
                <div className="w-[28px] h-[28px] rounded-[14px] bg-[#09CC7F] items-center justify-center flex">
                  <span className="material-icons text-[#FFFFFF] text-[18px]">
                    mic
                  </span>
                </div>
              </div>
              <div className="flex-1 flex flex-col overflow-hidden">
                <p className="truncate text-[#636366] text-[14px]">{text}</p>
                <p
                  className="mt-[8px] text-[#848487] text-[13px]"
                  suppressHydrationWarning
                >
                  {createdAtString}
                </p>
              </div>
            </div>
          );
        })}
      </div>
      <button
        className="bg-black py-[10px] px-[18px] rounded-[25px] flex items-center absolute bottom-[29px] right-[16px]"
        onClick={onClickRecord}
      >
        <span className="material-icons text-white text-[24px]">mic</span>
        <span className="text-white text-[14px] ml-[3px]">녹음하기</span>
      </button>
    </div>
  );
};

export default Home;
