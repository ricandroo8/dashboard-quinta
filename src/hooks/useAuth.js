import { useContext } from "react";

import AuthContext from "../auth/authContext";

export default function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth deve essere usato dentro AuthProvider.");
  }

  return context;
}
