import { Data, useDatabase } from "@/components/DataContext";
import Header from "@/components/Header";
import { formatTime } from "@/modules/Util";
import { useRouter } from "next/router";
import { useCallback, useEffect, useState } from "react";

const Tab = ({
  title,
  focused,
  onClick,
}: {
  title: string;
  focused?: boolean;
  onClick?: () => void;
}) => {
  return (
    <button
      className={`flex flex-1 justify-center items-center text-[16px] font-[500] py-[11px] ${
        focused
          ? "border-b-[2px] border-[#09CC7F] text-[#1A1A1A]"
          : "text-[#848487]"
      }`}
      onClick={onClick}
    >
      {title}
    </button>
  );
};

const Script = ({
  scripts,
}: {
  scripts: { start: number; end: number; text: string }[];
}) => {
  return (
    <div className="px-[16px] py-[24px]">
      <div className="flex flex-col gap-[18px]">
        {scripts.map((script, index) => {
          return (
            <div key={index}>
              <div className="text-[#848487] text-[15px] font-[400]">
                {`${formatTime(script.start)}-${formatTime(script.end)}`}
              </div>
              <div className="mt-[10px] text-[15px] font-[400] text-[#1A1A1A]">
                {script.text}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Recording = () => {
  const router = useRouter();

  const [data, setData] = useState<Data | null>(null);
  const { get } = useDatabase();

  useEffect(() => {
    if (typeof router.query.id === "string") {
      const document = get({ id: router.query.id });
      if (document != null) {
        setData(document);
        return;
      } else {
        throw new Error("Cannot load data");
      }
    }
  }, [get, router.query.id]);

  const [focusedTab, setFocusedTab] = useState<"script" | "summary">("script");

  const onPressScriptTab = useCallback(() => {
    setFocusedTab("script");
  }, []);
  const onPressSummaryTab = useCallback(() => {
    setFocusedTab("summary");
  }, []);

  return (
    <div className="h-screen bg-white flex flex-col">
      <Header title={"음성 기록"} />
      <div className="flex">
        <Tab
          title={"음성 기록"}
          focused={focusedTab === "script"}
          onClick={onPressScriptTab}
        />
        <Tab
          title={"요약"}
          focused={focusedTab === "summary"}
          onClick={onPressSummaryTab}
        />
      </div>

      <div className="flex-1 overflow-y-scroll overscroll-none">
        {data?.scripts != null && <Script scripts={data.scripts} />}
      </div>
    </div>
  );
};

export default Recording;
