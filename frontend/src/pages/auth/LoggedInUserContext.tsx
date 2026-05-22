import {
  createContext,
  useContext,
  useState,
  useEffect,
  type Dispatch,
  type ReactNode,
} from "react";
import Cookies from "universal-cookie";
import { setToken } from "../../helper/api";

export type LoggedInUser = {
  id: number;
  username: string;
  role: string;
  accessToken: string;
};

export type LoggedInUserContextType = {
  loggedInUser: LoggedInUser | null;
  setLoggedInUser: Dispatch<React.SetStateAction<LoggedInUser | null>>;
};

const LoggedInUserContext = createContext<LoggedInUserContextType | null>(null);

interface Props {
  children: ReactNode;
}

export const LoggedInUserContextProvider = ({ children }: Props) => {
  const cookies = new Cookies();
  const cookieData = cookies.get("loggedInUser");
  const initialLoggedInUser: LoggedInUser | null = cookieData || null;

  const [loggedInUser, setLoggedInUser] = useState<LoggedInUser | null>(
    initialLoggedInUser,
  );

  useEffect(() => {
    if (loggedInUser?.accessToken) {
      setToken(loggedInUser.accessToken);
    } else {
      setToken(null);
    }
  }, [loggedInUser]);

  return (
    <LoggedInUserContext.Provider value={{ loggedInUser, setLoggedInUser }}>
      {children}
    </LoggedInUserContext.Provider>
  );
};

export default LoggedInUserContextProvider;

export function useLoggedInUsersContext() {
  const context = useContext(LoggedInUserContext);
  if (!context)
    throw Error(
      "useLoggedInUserContext must be within LoggedInUserContextProvider",
    );
  return context;
}
