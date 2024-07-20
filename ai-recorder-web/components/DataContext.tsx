import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useState,
} from "react";

type Script = {
  start: number;
  end: number;
  text: string;
};

export type Data = {
  id: string;
  text: string;
  scripts: Script[];
  summary?: string;
};

type Database = { [id: string]: Data | undefined };

type ScriptContextType = {
  create: (data: Data) => void;
  get: ({ id }: { id: string }) => Data | undefined;
  update: ({ id, summary }: { id: string; summary?: string }) => void;
};

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [database, setDatabase] = useState<Database>({
    "1721464473516": {
      id: "1721464473516",
      text: "웹앱은 웹브라우저를 통해 접근할 수 있는 애플리케이션 소프트웨어로 인터넷 연결만 있으면 어디서나 사용할 수 있는 편리한 도구입니다. 설치 과정이 필요 없으며 사용자는 URL을 통해 쉽게 접근할 수 있습니다. 웹앱은 서버와 클라이언트 간의 상호작용을 통해 실시간으로 데이터가 업데이트되며 HTML, CSS, JavaScript 등의 웹기술을 사용하여 개발됩니다. 이를 통해 사용자들은 이메일 확인, 소셜네트워킹, 문서 편집, 쇼핑 등 다양한 작업을 웹브라우저 하나만으로 간편하게 처리할 수 있습니다. 웹앱은 다양한 디바이스와 운영체제에서 호환되므로 데스크탑, 노트북, 태블릿, 스마트폰 등 어떤 기기에서도 동일한 경험을 제공하며 중암 집중식 업데이트로 보안 패치나 기능 개선을 신속하게 배포할 수 있습니다.",
      scripts: [
        {
          start: 0,
          end: 11,
          text: "웹앱은 웹브라우저를 통해 접근할 수 있는 애플리케이션 소프트웨어로 인터넷 연결만 있으면 어디서나 사용할 수 있는 편리한 도구입니다.",
        },
        {
          start: 11,
          end: 17,
          text: "설치 과정이 필요 없으며 사용자는 URL을 통해 쉽게 접근할 수 있습니다.",
        },
        {
          start: 17,
          end: 23,
          text: "웹앱은 서버와 클라이언트 간의 상호작용을 통해 실시간으로 데이터가 업데이트되며",
        },
        {
          start: 23,
          end: 28,
          text: "HTML, CSS, JavaScript 등의 웹기술을 사용하여 개발됩니다.",
        },
        {
          start: 28,
          end: 34,
          text: "이를 통해 사용자들은 이메일 확인, 소셜네트워킹, 문서 편집, 쇼핑 등",
        },
        {
          start: 34,
          end: 39,
          text: "다양한 작업을 웹브라우저 하나만으로 간편하게 처리할 수 있습니다.",
        },
        {
          start: 39,
          end: 43,
          text: "웹앱은 다양한 디바이스와 운영체제에서 호환되므로",
        },
        {
          start: 43,
          end: 49,
          text: "데스크탑, 노트북, 태블릿, 스마트폰 등 어떤 기기에서도 동일한 경험을 제공하며",
        },
        {
          start: 49,
          end: 56,
          text: "중암 집중식 업데이트로 보안 패치나 기능 개선을 신속하게 배포할 수 있습니다.",
        },
      ],
    },
  });

  console.log(database);

  const create = useCallback((data: Data) => {
    setDatabase((prev) => ({
      ...prev,
      [data.id]: data,
    }));
  }, []);

  const get = useCallback(
    ({ id }: { id: string }) => {
      return database[id];
    },
    [database]
  );

  const update = useCallback(
    ({ id, summary }: { id: string; summary?: string }) => {
      setDatabase((prevDatabase) => {
        const prevData = prevDatabase[id];
        if (prevData == null) {
          return prevDatabase;
        }
        return {
          ...prevDatabase,
          [id]: {
            ...prevData,
            ...(summary != null ? { summary } : {}),
          },
        };
      });
    },
    []
  );

  return (
    <ScriptContext.Provider value={{ create, get, update }}>
      {children}
    </ScriptContext.Provider>
  );
};

export const useDatabase = () => {
  const context = useContext(ScriptContext);
  if (context === undefined) {
    throw new Error("useDatabase must to be within a DataProvider");
  }
  return context;
};
