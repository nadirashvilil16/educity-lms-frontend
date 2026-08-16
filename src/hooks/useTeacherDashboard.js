import { useCallback, useEffect, useState } from "react";
import { getDashboard } from "../services/teacher.service";

export function useTeacherDashboard(user) {
  const [state, setState] = useState({ data: null, loading: true, error: null });

  const load = useCallback(async (signal) => {
    setState((current) => ({ ...current, loading: true, error: null }));
    try {
      const payload = await getDashboard({ signal });
      setState({
        data: {
          teacher: { firstName: user?.firstName || "ლექტორი", lastName: user?.lastName || "" },
          groups: payload.groups || [],
          assignments: payload.assignments || [],
          lectures: payload.lectures || [],
          nextLecture: payload.nextLecture || null,
          previousLecture: payload.previousLecture || null,
          pendingGradingCount: payload.pendingGradingCount || 0,
        },
        loading: false,
        error: null,
      });
    } catch (error) {
      if (error?.name === "CanceledError" || error?.name === "AbortError") return;
      setState({ data: null, loading: false, error });
    }
  }, [user]);

  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, [load]);

  return { ...state, retry: () => load() };
}
