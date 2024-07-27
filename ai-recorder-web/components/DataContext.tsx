import {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
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
  photos?: string[];
  createdAt: number;
};

type Database = { [id: string]: Data | undefined };

type ScriptContextType = {
  create: (data: Data) => void;
  get: ({ id }: { id: string }) => Data | undefined;
  update: ({ id, summary }: { id: string; summary?: string }) => void;
  getAll: () => Data[];
};

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [database, setDatabase] = useState<Database>({});

  const [loaded, setLoaded] = useState(false);
  const hasReactNativeWebview =
    typeof window !== "undefined" && window.ReactNativeWebView != null;

  useEffect(() => {
    if (!loaded && hasReactNativeWebview) {
      window.ReactNativeWebView?.postMessage(
        JSON.stringify({ type: "load-database" })
      );
    }
  }, [hasReactNativeWebview, loaded]);

  useEffect(() => {
    if (loaded && hasReactNativeWebview) {
      window.ReactNativeWebView?.postMessage(
        JSON.stringify({ type: "save-database", data: database })
      );
    }
  }, [loaded, hasReactNativeWebview, database]);

  useEffect(() => {
    if (hasReactNativeWebview) {
      const handleMessage = (event: any) => {
        const { type, data } = JSON.parse(event.data);
        if (type === "onLoadDatabase") {
          setDatabase(data);
          setLoaded(true);
        }
      };
      window.addEventListener("message", handleMessage);
      document.addEventListener("message", handleMessage);
      return () => {
        window.removeEventListener("message", handleMessage);
        document.removeEventListener("message", handleMessage);
      };
    }
  }, [hasReactNativeWebview]);

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

  const getAll = useCallback(() => {
    return Object.values(database) as Data[];
  }, [database]);

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
    <ScriptContext.Provider value={{ create, get, update, getAll }}>
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
