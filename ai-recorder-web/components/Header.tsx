import { useRouter } from "next/router";
import { useCallback } from "react";

const Header = ({
  title,
  renderRight,
}: {
  title: string;
  renderRight?: () => JSX.Element;
}) => {
  const router = useRouter();
  const onPressBackButton = useCallback(() => {
    router.back();
  }, [router]);
  return (
    <div className="h-[44px] flex items-center">
      <div className="flex flex-1">
        <button className="ml-[20px]" onClick={onPressBackButton}>
          <span className="material-icons text-[#4A4A4A] text-[24px]">
            arrow_back_ios
          </span>
        </button>
      </div>
      <div className="flex flex-1 justify-center">
        <span className="text-[15px] text-[#4A4A4A]">{title}</span>
      </div>
      <div className="flex flex-1 justify-end">
        {renderRight != null && renderRight()}
      </div>
    </div>
  );
};

export default Header;
