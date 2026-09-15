import { useEffect, useState } from "react";
import { api } from "@/lib/api/client";

export type MentionServer = {
  readonly id: string;
  readonly ip: string;
  readonly nameKo: string;
  readonly nameEn: string;
};

type Page = { readonly rows: readonly MentionServer[] };

export type MentionPerson = {
  readonly id: string;
  readonly loginId: string;
  readonly name: string;
  readonly divisionId: string;
};

export function useMentionPeople(everyone = false): readonly MentionPerson[] {
  const [rows, setRows] = useState<readonly MentionPerson[]>([]);

  useEffect(() => {
    let alive = true;

    void api
      .get<{ readonly rows: readonly MentionPerson[] }>(
        everyone ? "/notes/people" : "/accounts",
        { background: true },
      )
      .then((res) => {
        if (!alive || !res.ok) return;

        setRows(res.data.rows);
      });

    return () => {
      alive = false;
    };
  }, [everyone]);

  return rows;
}

export function useMentionServers(): readonly MentionServer[] {
  const [rows, setRows] = useState<readonly MentionServer[]>([]);

  useEffect(() => {
    let alive = true;

    void api
      .get<Page>("/servers?page=1&pageSize=1000", { background: true })
      .then((res) => {
        if (!alive || !res.ok) return;

        setRows(res.data.rows);
      });

    return () => {
      alive = false;
    };
  }, []);

  return rows;
}
