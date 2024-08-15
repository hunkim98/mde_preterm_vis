import { createContext, useContext, useState } from "react";
import { LabelColor } from "../constants/color";

interface RepositoryContextProps {
  selectedLabel: LabelColor | null;
  setSelectedLabel: (label: string | null) => void;
}

const RepositoryContext = createContext<RepositoryContextProps>(
  {} as RepositoryContextProps
);

function RepositoryContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedLabel, setSelectedLabel] = useState<LabelColor | null>(null);
  const setLabel = (label: string | null) => {
    setSelectedLabel(label as LabelColor);
  };
  return (
    <RepositoryContext.Provider
      value={{
        selectedLabel,
        setSelectedLabel: setLabel,
      }}
    >
      {children}
    </RepositoryContext.Provider>
  );
}

export { RepositoryContext, RepositoryContextProvider };

export const useRepositoryContext = () => {
  return useContext(RepositoryContext);
};
