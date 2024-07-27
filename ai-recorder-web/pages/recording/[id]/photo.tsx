import { Data, useDatabase } from "@/components/DataContext";
import Header from "@/components/Header";
import Image from "next/image";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const Photo = () => {
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

  return (
    <div className="h-screen bg-white flex flex-col">
      <Header title={"사진 기록"} />
      <div className="flex-1 overflow-y-scroll overscroll-none px-[11px] py-[6px]">
        <div className="grid grid-cols-3 gap-[7px]">
          {data?.photos != null &&
            data.photos.map((photo, index) => {
              return (
                <Image
                  className="aspect-square object-cover w-full"
                  key={index}
                  src={photo}
                  alt={`Photo ${index + 1}`}
                  width={0}
                  height={0}
                />
              );
            })}
        </div>
      </div>
    </div>
  );
};

export default Photo;
