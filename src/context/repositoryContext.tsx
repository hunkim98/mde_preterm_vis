import { createContext, useContext, useState } from "react";
import { LabelColor } from "../constants/color";

interface RepositoryContextProps {}

const RepositoryContext = createContext<RepositoryContextProps>(
  {} as RepositoryContextProps
);

function RepositoryContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [clickedLabel, setClickedLabel] = useState<LabelColor | null>(null);
  return (
    <RepositoryContext.Provider
      value={{
        clickedLabel,
        setClickedLabel,
      }}
    >
      {children}
    </RepositoryContext.Provider>
  );
}

export { RepositoryContext, RepositoryContextProvider };

export const useRepositoryContext = () => {
  useContext(RepositoryContext);
};
