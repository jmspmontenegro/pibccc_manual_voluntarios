"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { LoadingOverlay } from "@/components/crud/loading-overlay";
import { togglePermission } from "./actions";

type Action = { domain_key: string; action_key: string; label: string };
type Domain = { key: string; label: string };

const ROLES = [
  { value: "admin", label: "Admin" },
  { value: "coordinator", label: "Coordenação" },
  { value: "leader", label: "Supervisão" },
  { value: "volunteer", label: "Voluntário" },
];

export function PermissionMatrix({
  domains,
  actions,
  granted,
}: {
  domains: Domain[];
  actions: Action[];
  granted: Set<string>;
}) {
  const [pending, startTransition] = useTransition();
  const router = useRouter();

  function toggle(role: string, domain_key: string, action_key: string, next: boolean) {
    startTransition(async () => {
      const formData = new FormData();
      formData.set("role", role);
      formData.set("domain_key", domain_key);
      formData.set("action_key", action_key);
      formData.set("granted", String(next));
      await togglePermission(formData);
      router.refresh();
    });
  }

  return (
    <>
      <LoadingOverlay show={pending} />
      <div className="flex flex-col gap-8">
      {domains.map((domain) => {
        const domainActions = actions.filter((a) => a.domain_key === domain.key);
        if (domainActions.length === 0) return null;

        return (
          <div key={domain.key} className="rounded-xl border">
            <div className="border-b bg-muted/50 px-4 py-2 font-semibold">{domain.label}</div>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ação</TableHead>
                  {ROLES.map((r) => (
                    <TableHead key={r.value} className="text-center">
                      {r.label}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {domainActions.map((action) => (
                  <TableRow key={action.action_key}>
                    <TableCell>{action.label}</TableCell>
                    {ROLES.map((r) => {
                      const key = `${r.value}:${domain.key}:${action.action_key}`;
                      const isGranted = granted.has(key);
                      return (
                        <TableCell key={r.value} className="text-center">
                          <Checkbox
                            checked={isGranted}
                            disabled={pending}
                            onCheckedChange={(checked) =>
                              toggle(r.value, domain.key, action.action_key, checked === true)
                            }
                          />
                        </TableCell>
                      );
                    })}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        );
      })}
      </div>
    </>
  );
}
