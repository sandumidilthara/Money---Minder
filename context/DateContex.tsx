import React, { createContext, useContext, useState } from "react";

interface DateContextType {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
}

const DateContext = createContext<DateContextType | undefined>(undefined);

export const useDateContext = () => {
  const context = useContext(DateContext);
  if (context === undefined) {
    throw new Error("useDateContext must be used within a DateProvider");
  }
  return context;
};

export const DateProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  return (
    <DateContext.Provider value={{ currentDate, setCurrentDate }}>
      {children}
    </DateContext.Provider>
  );
};
