import { AuthContext } from "@contexts/AuthContext";
import { useContext } from "react";


export function useAuth(){
  const contextData = useContext(AuthContext);
  return contextData
}