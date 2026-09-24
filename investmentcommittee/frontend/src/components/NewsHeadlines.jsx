import styled from "styled-components";
import { timeAgo } from "../formatters";

const List = styled.ul`
  list-style: none;
  margin: 0 0 10px;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Item = styled.li`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  font-size: 13px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  padding-bottom: 6px;
`;

const HeadlineTitle = styled.span`
  color: ${({ theme }) => theme.colors.text};
  line-height: 135%;
`;

const HeadlineTime = styled.span`
  font-family: ${({ theme }) => theme.fonts.mono};
  color: ${({ theme }) => theme.colors.textMuted};
  font-size: 11px;
  white-space: nowrap;
  flex-shrink: 0;
`;

export function NewsHeadlines({ headlines }) {
  if (!headlines?.length) return null;
  return (
    <List>
      {headlines.slice(0, 5).map((h, i) => (
        <Item key={i}>
          <HeadlineTitle>{h.title}</HeadlineTitle>
          <HeadlineTime>{timeAgo(h.publishedAt)}</HeadlineTime>
        </Item>
      ))}
    </List>
  );
}
