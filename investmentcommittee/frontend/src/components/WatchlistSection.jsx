import { useState } from "react";
import styled from "styled-components";
import { Link } from "react-router-dom";
import { useWatchlist } from "../hooks/useWatchlist";
import { Row, Input } from "../appPrimitives";
import { Button } from "../primitives";
import { Tabs } from "./Tabs";
import { WatchlistCompanyDetail } from "./WatchlistCompanyDetail";

const MARKETS = [
  { key: "us", label: "US" },
  { key: "india", label: "India" },
];

const AddRow = styled(Row)`
  margin-bottom: 20px;
`;

const List = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 640px;
`;

const Item = styled.li`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  padding: 10px 14px;
  background: ${({ theme }) => theme.colors.surface};
`;

const ItemHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const ExpandButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textMuted};
  cursor: pointer;
  padding: 2px;
  display: flex;
  align-items: center;
  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Ticker = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  font-weight: 600;
  color: ${({ theme }) => theme.colors.text};
  letter-spacing: 0.4px;
`;

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AnalyzeLink = styled(Link)`
  font-family: ${({ theme }) => theme.fonts.sans};
  font-size: 13px;
  color: ${({ theme }) => theme.colors.accent};
  text-decoration: none;
  border: 1px solid ${({ theme }) => theme.colors.accent};
  border-radius: 4px;
  padding: 4px 10px;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 18px;
  line-height: 1;
  cursor: pointer;
  padding: 0 4px;
  &:hover {
    color: ${({ theme }) => theme.colors.accent};
  }
`;

const Empty = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textMuted};
  font-style: italic;
`;

function ChevronDownIcon({ $expanded }) {
  return (
    <svg
      width="15"
      height="15"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ transform: $expanded ? "rotate(180deg)" : "none" }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function WatchlistTab({ market }) {
  const { tickers, addTicker, removeTicker, loading } = useWatchlist(market);
  const [input, setInput] = useState("");
  const [expanded, setExpanded] = useState(null);

  function toggleExpanded(ticker) {
    setExpanded((prev) => (prev === ticker ? null : ticker));
  }

  function handleAdd() {
    if (!input.trim()) return;
    addTicker(input);
    setInput("");
  }

  return (
    <div>
      <AddRow>
        <Input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder={market === "india" ? 'e.g. "RELIANCE.NS"' : 'e.g. "AAPL"'}
        />
        <Button onClick={handleAdd} disabled={!input.trim()}>
          Add
        </Button>
      </AddRow>

      {loading ? (
        <Empty>Loading your watchlist…</Empty>
      ) : tickers.length === 0 ? (
        <Empty>No stocks tracked yet — add one above.</Empty>
      ) : (
        <List>
          {tickers.map((ticker) => (
            <Item key={ticker}>
              <ItemHeader>
                <Ticker>{ticker}</Ticker>
                <Actions>
                  <AnalyzeLink to="/" state={{ prompt: `Should I invest in ${ticker}?`, autoRun: true }}>
                    Analyze
                  </AnalyzeLink>
                  <ExpandButton
                    onClick={() => toggleExpanded(ticker)}
                    aria-label={expanded === ticker ? `Hide ${ticker} details` : `Show ${ticker} details`}
                    aria-expanded={expanded === ticker}
                    title="Trends & fundamentals"
                  >
                    <ChevronDownIcon $expanded={expanded === ticker} />
                  </ExpandButton>
                  <RemoveButton onClick={() => removeTicker(ticker)} aria-label={`Remove ${ticker}`}>
                    ×
                  </RemoveButton>
                </Actions>
              </ItemHeader>
              {expanded === ticker && <WatchlistCompanyDetail ticker={ticker} />}
            </Item>
          ))}
        </List>
      )}
    </div>
  );
}

export function WatchlistSection() {
  const [activeMarket, setActiveMarket] = useState("us");

  return (
    <div>
      <Tabs tabs={MARKETS} active={activeMarket} onChange={setActiveMarket} inner />
      {/* key={activeMarket} forces a remount on switch so useWatchlist reloads
          that market's list from storage instead of keeping stale state. */}
      <WatchlistTab key={activeMarket} market={activeMarket} />
    </div>
  );
}
