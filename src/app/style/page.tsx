import { notFound } from "next/navigation";
import { SectionHeading, Rule } from "@/components/section-heading";
import { Button, ButtonLink } from "@/components/button";
import { Badge, StatusFlag } from "@/components/badge";
import {
  Table,
  THead,
  TBody,
  TR,
  TH,
  TD,
  TDNumeric,
} from "@/components/table";
import { Field, Input, Textarea, Select, Checkbox, Label } from "@/components/input";
import { Panel, Card, SpecList } from "@/components/panel";
import { Meter } from "@/components/meter";
import { BracketLink, TextLink, ArrowLink } from "@/components/link";
import {
  jobMarker,
  jobPercent,
  jobProgressText,
  jobStateLabel,
} from "@/lib/job-view";
import {
  TYPE_SCALE,
  PALETTE,
  ARTIFACTS,
  ACCENTS,
  COMPLIANCE,
  JOB_STATES,
} from "@/lib/specimen";

function Block({
  index,
  title,
  note,
  children,
}: {
  index: string;
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-line last:border-b-0">
      <div className="bg-surface px-2 py-1.5 sm:px-3">
        <SectionHeading index={index} title={title} note={note} />
      </div>
      <div className="px-2 py-3 sm:px-3">{children}</div>
    </section>
  );
}

export default function Home() {
  if (process.env.NODE_ENV === "production") notFound();

  return (
    <>
      <div className="border-b border-line px-2 py-4 sm:px-3 sm:py-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between lg:gap-8">
          <div className="min-w-0">
            <p className="text-xs text-muted">
              TECHNICAL REFERENCE / STYLE SPECIFICATION
            </p>
            <h1 className="mt-1 text-lg font-bold uppercase tracking-wider">
              design system
            </h1>
            <p className="mt-1 max-w-2xl text-xs text-muted-strong">
              Monospaced editorial. Duotone, hairline-ruled, zero-radius. Built
              from the tokens in <code className="bg-surface px-1">globals.css</code>.
            </p>
          </div>
          <div className="w-full shrink-0 lg:max-w-xs">
            <SpecList
              items={[
                { term: "revision", value: "0001" },
                { term: "theme", value: "light / dark (manual)" },
                { term: "grid", value: "full-bleed framed" },
                { term: "radius", value: "0px" },
              ]}
            />
          </div>
        </div>
      </div>

      <Block index="01" title="TYPE SCALE" note={`${TYPE_SCALE.length} steps`}>
        <Table>
          <THead>
            <TR>
              <TH className="w-20">TOKEN</TH>
              <TH className="w-16">SIZE</TH>
              <TH className="w-56">USE</TH>
              <TH>SAMPLE</TH>
            </TR>
          </THead>
          <TBody>
            {TYPE_SCALE.map((t) => (
              <TR key={t.cls} hover>
                <TD className="font-bold">{t.cls}</TD>
                <TDNumeric>{t.px}</TDNumeric>
                <TD className="text-muted">{t.use}</TD>
                <TD>
                  <span className={t.cls}>{t.sample}</span>
                </TD>
              </TR>
            ))}
            <TR>
              <TD className="font-bold">
                font-bold
                <span className="text-muted"> / uppercase</span>
              </TD>
              <TDNumeric>--</TDNumeric>
              <TD className="text-muted">headings, labels, buttons</TD>
              <TD>
                <span className="text-lg font-bold uppercase tracking-wider">
                  Section Heading
                </span>
              </TD>
            </TR>
          </TBody>
        </Table>
      </Block>

      <Block index="02" title="PALETTE" note="duotone + inversion">
        <Table>
          <THead>
            <TR>
              <TH className="w-10"> </TH>
              <TH className="w-48">TOKEN</TH>
              <TH className="w-40">CLASS</TH>
              <TH className="w-24">LIGHT</TH>
              <TH className="w-24">DARK</TH>
              <TH>ROLE</TH>
            </TR>
          </THead>
          <TBody>
            {PALETTE.map((c) => (
              <TR key={c.token} hover>
                <TD>
                  <span
                    className={`block size-3 border border-line ${c.cls}`}
                    aria-hidden
                  />
                </TD>
                <TD className="font-bold">{c.token}</TD>
                <TD className="text-muted">{c.cls}</TD>
                <TD className="tabular-nums">{c.light}</TD>
                <TD className="tabular-nums">{c.dark}</TD>
                <TD className="text-muted">{c.role}</TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Block>

      <Block index="03" title="CONTROLS" note="inverted hover">
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="solid">submit</Button>
            <Button variant="outline">cancel</Button>
            <Button variant="ghost">reset</Button>
            <Button variant="outline" disabled>
              disabled
            </Button>
          </div>

          <Rule />

          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm">
              small
            </Button>
            <Button variant="outline" size="md">
              medium
            </Button>
            <ButtonLink variant="solid" size="md" href="#">
              [download]
            </ButtonLink>
          </div>

          <Rule />

          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="solid">stable</Badge>
            <Badge variant="outline">draft</Badge>
            <Badge variant="muted">archived</Badge>
            <span className="text-xs text-muted">
              v1.4.2 &middot; 2026-09-26 &middot; 4m 12s
            </span>
          </div>

          <Rule />

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
            <StatusFlag state="on">ready</StatusFlag>
            <StatusFlag state="partial">staged</StatusFlag>
            <StatusFlag state="off">missing</StatusFlag>
          </div>

          <Rule />

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
            <BracketLink href="#">view</BracketLink>
            <BracketLink href="#">download</BracketLink>
            <BracketLink href="#">details</BracketLink>
            <ArrowLink href="#">open archive</ArrowLink>
            <span className="text-muted">
              inline: <TextLink href="#">linked reference</TextLink>
            </span>
          </div>
        </div>
      </Block>

      <Block index="04" title="DATA" note={`${ARTIFACTS.length} rows`}>
        <Table>
          <THead>
            <TR>
              <TH className="w-16">#</TH>
              <TH>ARTIFACT</TH>
              <TH className="w-24 text-right">SIZE</TH>
              <TH className="w-32">CHECKSUM</TH>
              <TH className="w-32">STATE</TH>
            </TR>
          </THead>
          <TBody>
            {ARTIFACTS.map((a) => (
              <TR key={a.id} hover className="cursor-pointer">
                <TDNumeric>{a.id}</TDNumeric>
                <TD className="font-bold">{a.name}</TD>
                <TDNumeric>{a.size}</TDNumeric>
                <TD className="text-muted">{a.checksum}</TD>
                <TD>
                  <StatusFlag state={a.state}>{a.label}</StatusFlag>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </Block>

      <Block index="05" title="MEASURES" note={`${JOB_STATES.length} states`}>
        <Table>
          <THead>
            <TR>
              <TH className="w-28">STATE</TH>
              <TH>PROGRESS</TH>
              <TH className="w-72">LABEL</TH>
            </TR>
          </THead>
          <TBody>
            {JOB_STATES.map((state) => {
              const percent = jobPercent(state);

              return (
                <TR key={state.id} hover>
                  <TD className="font-bold">
                    <span aria-hidden className="mr-1 text-muted">
                      {jobMarker(state)}
                    </span>
                    {state.state}
                  </TD>
                  <TD>
                    {state.state === "failed" ? (
                      <span className="text-muted">--</span>
                    ) : (
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        {state.total === null ? (
                          <span aria-hidden className="text-muted">
                            [----------------------]
                          </span>
                        ) : (
                          <Meter
                            value={state.received}
                            max={state.total}
                            label={`${state.file ?? state.host} download`}
                          />
                        )}
                        <span className="tabular-nums">
                          {percent === null ? "--" : `${percent}%`}
                        </span>
                      </div>
                    )}
                  </TD>
                  <TD className="text-muted">
                    {jobStateLabel(state)}
                    <span className="block tabular-nums">
                      {jobProgressText(state)}
                    </span>
                  </TD>
                </TR>
              );
            })}
          </TBody>
        </Table>
        <div className="mt-3 flex flex-col gap-1.5">
          <p className="text-xs text-muted">refusal strip</p>
          <div className="border border-line bg-surface px-2 py-1.5 text-xs">
            <span aria-hidden className="font-bold">
              [error]{" "}
            </span>
            <span>too many links from this address -- try again in 42m18s</span>
          </div>
        </div>
      </Block>

      <Block index="06" title="FORMS" note="uncontrolled inputs">
        <form className="grid gap-3 md:grid-cols-2">
          <Field label="identifier" hint="required" htmlFor="spec-id">
            <Input id="spec-id" name="spec-id" placeholder="example-0001" />
          </Field>

          <Field label="format" hint="enum" htmlFor="spec-format">
            <Select id="spec-format" name="spec-format" defaultValue="bin">
              <option value="bin">bin</option>
              <option value="pak">pak</option>
              <option value="rom">rom</option>
            </Select>
          </Field>

          <Field
            label="notes"
            hint="plain text"
            htmlFor="spec-notes"
            className="md:col-span-2"
          >
            <Textarea
              id="spec-notes"
              name="spec-notes"
              rows={3}
              placeholder="Free-form annotation. No rich text."
            />
          </Field>

          <div className="flex flex-col gap-2 md:col-span-2">
            <div className="flex items-center gap-2">
              <Checkbox id="spec-verify" name="spec-verify" defaultChecked />
              <Label htmlFor="spec-verify">verify checksum on read</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="spec-keep" name="spec-keep" />
              <Label htmlFor="spec-keep">retain intermediate artifacts</Label>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 md:col-span-2">
            <Button variant="solid" type="submit">
              save
            </Button>
            <Button variant="outline" type="reset">
              clear
            </Button>
          </div>
        </form>
      </Block>

      <Block index="07" title="PANELS" note="containers">
        <div className="grid gap-3 md:grid-cols-2">
          <Panel title="panel / default" meta="0.9 KB">
            <p className="text-xs text-muted-strong">
              A bordered container with a titled header strip.
            </p>
            <Rule className="my-2" />
            <SpecList
              items={[
                { term: "border", value: "1px solid --line" },
                { term: "header bg", value: "--bg-subtle" },
                { term: "padding", value: "8px" },
              ]}
            />
          </Panel>

          <div className="flex flex-col gap-3">
            <Card>
              <p className="text-xs font-bold uppercase tracking-wider">
                card / static
              </p>
              <p className="mt-1 text-xs text-muted">
                A bare bordered tile with no header.
              </p>
            </Card>
            <Card interactive>
              <p className="text-xs font-bold uppercase tracking-wider">
                card / interactive
              </p>
              <p className="mt-1 text-xs text-muted">Inverts on hover.</p>
            </Card>
          </div>
        </div>
      </Block>

      <Block index="08" title="ACCENTS" note="ASCII vocabulary">
        <div className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 xl:grid-cols-3">
          {ACCENTS.map((a) => (
            <div
              key={a.glyph}
              className="flex items-baseline gap-3 border-b border-line-subtle py-1"
            >
              <code className="w-16 shrink-0 text-xs font-bold">{a.glyph}</code>
              <span className="text-xs text-muted">{a.use}</span>
            </div>
          ))}
        </div>
      </Block>

      <Block index="09" title="COMPLIANCE" note="enforced, not aspirational">
        <div className="grid gap-1.5 lg:grid-cols-2">
          {COMPLIANCE.map((c) => (
            <StatusFlag key={c.rule} state={c.state}>
              {c.rule}
            </StatusFlag>
          ))}
        </div>
      </Block>
    </>
  );
}
