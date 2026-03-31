import { createContext, useContext, useState, ReactNode } from "react";

type BoardContextType = {
  activeBoardId: string | null;
  setActiveBoardId: (id: string | null) => void;
};

const BoardContext = createContext<BoardContextType>({ activeBoardId: null, setActiveBoardId: () => {} });

export const BoardProvider = ({ children }: { children: ReactNode }) => {
  const [activeBoardId, setActiveBoardId] = useState<string | null>(null);
  return (
    <BoardContext.Provider value={{ activeBoardId, setActiveBoardId }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useActiveBoard = () => useContext(BoardContext);
