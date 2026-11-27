"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { Panel } from "@/components/common/display";
import { DetailsSkeleton } from "@/components/common/skeletons";
import { EmptyState } from "@/components/common/states";
import { useViewAsUser } from "@/lib/api/queries";
import { searchSchema, type SearchValues } from "@/lib/forms";
import { humanize } from "@/lib/modules";

const PROFILE_FIELDS = ["fullName", "email", "mobileNumber", "userType", "userStatus", "kycVerified", "wallet", "walletUSD", "registrationStep", "createdAt"];

/** Read-only user lookup shown on the View as User page. */
export function ViewAsUserLookup() {
  const [search, setSearch] = useState("");
  const form = useForm<SearchValues>({ resolver: zodResolver(searchSchema), defaultValues: { search: "" } });
  const res = useViewAsUser(search);
  const user = res.data?.user;
  const pending = res.isFetching;
  const error = form.formState.errors.search;
  return (
    <div style={{ marginTop: 14 }}>
      <Panel title="Look up a user (read-only)">
        <form className="flex gap-2.5 p-[15px]" onSubmit={form.handleSubmit((v) => setSearch(v.search))} noValidate aria-busy={pending}>
          <Field className="flex-1" data-invalid={!!error}>
            <FieldLabel htmlFor="view-as-user-search" className="sr-only">
              Name, phone or email
            </FieldLabel>
            <InputGroup className="h-9 bg-white">
              <InputGroupAddon>
                <Search aria-hidden="true" />
              </InputGroupAddon>
              <InputGroupInput
                id="view-as-user-search"
                type="search"
                placeholder="Name, phone or email"
                aria-invalid={!!error}
                disabled={pending}
                {...form.register("search")}
              />
            </InputGroup>
          </Field>
          <Button type="submit" disabled={pending}>
            {pending && <Spinner />}
            {pending ? "Looking up…" : "View as user"}
          </Button>
        </form>
        <FieldError className="form-error" style={{ margin: "0 15px 12px" }} errors={[error]} />
        {pending && (
          <div className="sheet-body">
            <DetailsSkeleton rows={6} label="Looking up user…" />
          </div>
        )}
        {res.error && !pending && <EmptyState description={res.error.message} />}
        {user && !pending && (
          <div className="sheet-body">
            {res.data?.notice && <p className="muted">{res.data.notice}</p>}
            <dl>
              {PROFILE_FIELDS.filter((f) => user[f] !== undefined).map((f) => (
                <div key={f}>
                  <dt>{humanize(f)}</dt>
                  <dd>{String(user[f])}</dd>
                </div>
              ))}
            </dl>
          </div>
        )}
      </Panel>
    </div>
  );
}
