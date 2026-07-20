import { useCallback, useEffect, useState } from "react";
import { getDashboard } from "../services/student.service";
import { mapStudentDashboard, studentDashboardPreview } from "../pages/student/studentDashboard.mapper";

export function useStudentDashboard(user) {
  const [state, setState] = useState({ data: null, loading: true, error: null });
  const isPreview = import.meta.env.DEV && new URLSearchParams(window.location.search).get("preview") === "student";

  const load = useCallback(async (signal) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const payload = isPreview ? studentDashboardPreview : await getDashboard({ signal });
      setState({ data: mapStudentDashboard(payload, user), loading: false, error: null });
    } catch (error) {
      if (error?.name === "CanceledError" || error?.name === "AbortError") return;
      setState({ data: null, loading: false, error });
    }
  }, [isPreview, user]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return { ...state, retry: () => load() };
}
