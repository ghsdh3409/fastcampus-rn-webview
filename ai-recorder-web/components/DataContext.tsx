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
};

type Database = { [id: string]: Data | undefined };

type ScriptContextType = {
  create: (data: Data) => void;
  get: ({ id }: { id: string }) => Data | undefined;
};

const ScriptContext = createContext<ScriptContextType | undefined>(undefined);

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [database, setDatabase] = useState<Database>({});

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

  return (
    <ScriptContext.Provider value={{ create, get }}>
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
