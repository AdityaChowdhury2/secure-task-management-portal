"use client";

import { useEffect, useRef } from "react";
import { Provider } from "react-redux";
import { store } from "@/redux/store";
import { api } from "@/redux/api";
import { useAppDispatch } from "@/redux/hooks";

function SessionRestore({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const started = useRef(false);

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    dispatch(api.endpoints.refreshSession.initiate());
  }, [dispatch]);

  return <>{children}</>;
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Provider store={store}>
      <SessionRestore>{children}</SessionRestore>
    </Provider>
  );
}
