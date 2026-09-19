"use client";

import { useMemo, useState } from "react";
import { useActionState } from "react";
import { updateProfileAction, type ProfileFormState } from "@/app/account/actions";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ProfileMediaFields } from "@/components/profile-media-fields";
import { FarmtecFields } from "@/components/farmtec-fields";
import { Textarea } from "@/components/ui/textarea";
import { ALLIANCES, allianceForPlace, type AllianceSlug } from "@/lib/alliances";
import type { Account } from "@/lib/auth";
import { CERTIFIERS, certifiersForState } from "@/lib/certifiers";
import { COOPS } from "@/lib/coops";
import { AFFILIATION_ORG_SLUGS, organizationBySlug } from "@/lib/organizations";
import { formatAccreditations } from "@/lib/profile-affiliations";
import { COUNTIES_BY_STATE } from "@/lib/region-counties";
import { SERVICE_STATES, type ServiceState } from "@/lib/region";
import { OrgMark } from "@/components/org-mark";

const initialState: ProfileFormState = { message: null };

function Flag({
  name,
  label,
  hint,
  defaultChecked,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultChecked: boolean;
}) {
  return (
    <label className="flex gap-3 rounded-md border border-border/70 px-3 py-2.5 text-sm">
      <input
        type="checkbox"
        name={name}
        value="yes"
        defaultChecked={defaultChecked}
        className="mt-0.5 size-4 shrink-0 accent-[var(--land)]"
      />
      <span>
        <span className="font-medium text-foreground">{label}</span>
        {hint ? <span className="mt-0.5 block text-muted-foreground">{hint}</span> : null}
      </span>
    </label>
  );
}

export function HomePlaceForm({ account }: { account: Account }) {
  const [state, action, pending] = useActionState(updateProfileAction, initialState);
  const [homeState, setHomeState] = useState<ServiceState | "">(account.homeState ?? "");
  const [homeCounty, setHomeCounty] = useState(account.homeCounty ?? "");
  const [organicCertified, setOrganicCertified] = useState(
    account.organicCertified ? "yes" : "no",
  );
  const [organicCertifier, setOrganicCertifier] = useState<string>(
    account.organicCertifier ?? "oeffa",
  );
  const [otherCertified, setOtherCertified] = useState(account.otherCertified);

  const counties = homeState ? COUNTIES_BY_STATE[homeState] : [];
  const previewSlug = allianceForPlace(homeState || null, homeCounty || null);
  const preview = previewSlug ? ALLIANCES[previewSlug as AllianceSlug] : null;
  const countyOptions = useMemo(() => [...counties], [counties]);
  const selectedCoops = new Set(account.coops.map((coop) => coop.slug));
  const selectedAffiliations = new Set(account.affiliationOrgs);
  const certifierOptions = useMemo(
    () => certifiersForState(homeState || null),
    [homeState],
  );

  return (
    <form action={action} className="grid gap-5">
      {state.message ? (
        <Alert variant="destructive">
          <AlertDescription>{state.message}</AlertDescription>
        </Alert>
      ) : null}

      <div className="grid gap-1.5">
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          name="displayName"
          required
          minLength={2}
          maxLength={80}
          defaultValue={account.displayName}
        />
      </div>

      <ProfileMediaFields
        userId={account.id}
        avatarUrl={account.avatarUrl}
        logoUrl={account.logoUrl}
        pasturePhotos={account.pasturePhotos}
        livestockPhotos={account.livestockPhotos}
      />

      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">What you do on the exchange</legend>
        <p className="text-sm text-muted-foreground">
          You can be both. Post land listings when you have forage, livestock
          listings when you have a herd or flock looking for a place.
        </p>
        <Flag
          name="offersLand"
          label="I offer forage / host grazing"
          hint="Pasture, cover crops, residue, or woods."
          defaultChecked={account.offersLand}
        />
        <Flag
          name="offersLivestock"
          label="I have livestock looking for forage"
          hint="Cattle, sheep, goats, horses, or mixed."
          defaultChecked={account.offersLivestock}
        />
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="grid gap-1.5">
          <Label>Home state</Label>
          <input type="hidden" name="homeState" value={homeState} />
          <Select
            value={homeState || "unset"}
            onValueChange={(value) => {
              const next = value === "unset" ? "" : (value as ServiceState);
              setHomeState(next);
              setHomeCounty("");
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Choose a state" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unset">Not set yet</SelectItem>
              {SERVICE_STATES.map((state) => (
                <SelectItem key={state} value={state}>
                  {state}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1.5">
          <Label>Home county</Label>
          <input type="hidden" name="homeCounty" value={homeCounty} />
          <Select
            value={homeCounty || "unset"}
            onValueChange={(value) => setHomeCounty(value === "unset" ? "" : value)}
            disabled={!homeState}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={homeState ? "Choose a county" : "Choose a state first"} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="unset">Not set yet</SelectItem>
              {countyOptions.map((county) => (
                <SelectItem key={county} value={county}>
                  {county}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {preview
          ? `That place sits in the ${preview.name}.`
          : "Home county puts you in a quadrant alliance. Leave blank if you would rather not join yet."}
      </p>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Memberships and certifications</legend>
        <Flag name="memberOeffa" label="OEFFA member" defaultChecked={account.memberOeffa} />
        <Flag name="memberSare" label="SARE participant or grantee" defaultChecked={account.memberSare} />
        <Flag
          name="oeffaCertified"
          label="OEFFA certified"
          defaultChecked={account.oeffaCertified}
        />
        <div className="grid gap-1.5">
          <Label>USDA / organic status</Label>
          <input type="hidden" name="organicCertified" value={organicCertified} />
          <Select value={organicCertified} onValueChange={setOrganicCertified}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="no">Not organic</SelectItem>
              <SelectItem value="yes">Organic certified operation</SelectItem>
            </SelectContent>
          </Select>
          <p className="text-sm text-muted-foreground">
            Marks that the farm holds organic certification somewhere. Each
            listing still chooses organic or conventional for that field or
            herd — a farm can post 100 organic acres and 300 conventional acres
            as separate listings.
          </p>
        </div>
        {organicCertified === "yes" ? (
          <div className="grid gap-1.5">
            <Label>Organic certifier</Label>
            <input type="hidden" name="organicCertifier" value={organicCertifier} />
            <Select value={organicCertifier} onValueChange={setOrganicCertifier}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Choose certifier" />
              </SelectTrigger>
              <SelectContent>
                {(certifierOptions.length ? certifierOptions : CERTIFIERS).map((certifier) => (
                  <SelectItem key={certifier.slug} value={certifier.slug}>
                    {certifier.shortName}
                    {certifier.regional ? " · regional" : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              USDA-accredited agents known in the Valley. Pick Other if yours is not listed.
            </p>
          </div>
        ) : (
          <input type="hidden" name="organicCertifier" value="" />
        )}
        <label className="flex gap-3 rounded-md border border-border/70 px-3 py-2.5 text-sm">
          <input
            type="checkbox"
            name="otherCertified"
            value="yes"
            checked={otherCertified}
            onChange={(event) => setOtherCertified(event.target.checked)}
            className="mt-0.5 size-4 shrink-0 accent-[var(--land)]"
          />
          <span className="font-medium text-foreground">Other certified</span>
        </label>
        {otherCertified ? (
          <div className="grid gap-1.5">
            <Label htmlFor="otherCertificationNotes">Other certification</Label>
            <Input
              id="otherCertificationNotes"
              name="otherCertificationNotes"
              maxLength={200}
              defaultValue={account.otherCertificationNotes ?? ""}
              placeholder="Program or certifier name"
            />
          </div>
        ) : null}
      </fieldset>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Extension and partners</legend>
        <p className="text-sm text-muted-foreground">
          Optional affiliations shown with logos on your public profile.
        </p>
        {AFFILIATION_ORG_SLUGS.map((slug) => {
          const org = organizationBySlug(slug);
          if (!org) return null;
          return (
            <label
              key={slug}
              className="flex gap-3 rounded-md border border-border/70 px-3 py-2.5 text-sm"
            >
              <input
                type="checkbox"
                name="affiliationOrgs"
                value={slug}
                defaultChecked={selectedAffiliations.has(slug)}
                className="mt-0.5 size-4 shrink-0 accent-[var(--land)]"
              />
              <span className="flex min-w-0 flex-1 items-start gap-3">
                <OrgMark org={slug} />
                <span>
                  <span className="font-medium text-foreground">{org.shortName}</span>
                  <span className="mt-0.5 block text-muted-foreground">{org.blurb}</span>
                </span>
              </span>
            </label>
          );
        })}
      </fieldset>

      <div className="grid gap-1.5">
        <Label htmlFor="accreditations">Other accreditations</Label>
        <Textarea
          id="accreditations"
          name="accreditations"
          rows={3}
          defaultValue={formatAccreditations(account.accreditations)}
          placeholder="One per line — grazing school, animal welfare labels, etc."
        />
        <p className="text-sm text-muted-foreground">Comma or line separated. Up to 12.</p>
      </div>

      <fieldset className="grid gap-2">
        <legend className="text-sm font-medium">Co-ops</legend>
        <p className="text-sm text-muted-foreground">
          Checking a co-op opens its private forum lane for you. Co-op staff
          accounts are marked separately by a host so they can post notices to
          members.
        </p>
        {COOPS.map((coop) => (
          <label
            key={coop.slug}
            className="flex gap-3 rounded-md border border-border/70 px-3 py-2.5 text-sm"
          >
            <input
              type="checkbox"
              name="coops"
              value={coop.slug}
              defaultChecked={selectedCoops.has(coop.slug)}
              className="mt-0.5 size-4 shrink-0 accent-[var(--land)]"
            />
            <span>
              <span className="font-medium text-foreground">{coop.name}</span>
              <span className="mt-0.5 block text-muted-foreground">{coop.description}</span>
            </span>
          </label>
        ))}
      </fieldset>

      <FarmtecFields farmtec={account.farmtec} />

      <Button type="submit" disabled={pending} className="w-fit">
        {pending ? "Saving…" : "Save profile"}
      </Button>
    </form>
  );
}
