import { useState } from "react";
import { WatchlistSection } from "../components/WatchlistSection";
import { AnalysisSettings } from "../components/AnalysisSettings";
import { Tabs } from "../components/Tabs";
import { PageHeader, PageTitle, Subtitle } from "../appPrimitives";

const SECTIONS = [
  { key: "watchlist", label: "Watchlist" },
  { key: "analysis", label: "Analysis" },
];

export default function SettingsPage() {
  const [active, setActive] = useState("watchlist");

  return (
    <div>
      <PageHeader>
        <PageTitle>Settings</PageTitle>
        <Subtitle>Manage your watchlist and tune how the committee analyzes stocks.</Subtitle>
      </PageHeader>

      <Tabs tabs={SECTIONS} active={active} onChange={setActive} />

      {active === "watchlist" && <WatchlistSection />}
      {active === "analysis" && <AnalysisSettings />}
    </div>
  );
}
