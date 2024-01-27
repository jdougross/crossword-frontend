import { Box, Flex, Heading } from "@chakra-ui/react";

export const theme = {
  border: {
    width: "1px",
  },
  color: {
    background: "white",
    foreground: "black",
    highlight: "#BDF",
  },
};

export const fullSize = { w: "100%", h: "100%" };

export function HeaderSection({
  author,
  date,
  title,
}: {
  author: string;
  date: string;
  title: string;
}) {
  return (
    <Flex direction="column" align="center" justify="space-between" w="100%">
      <Heading color={theme.color.background}>{title}</Heading>
      {/* <Heading color={theme.color.background}>{date}</Heading> */}
      {/* <Heading color={theme.color.background}>{`by ${author}`}</Heading> */}
    </Flex>
  );
}

export function parseRawClue(clueString: string) {
  const dot = clueString.indexOf(".");
  const number = Number(clueString.slice(0, dot));
  const text = clueString.slice(dot + 1).trim();
  return { number, text };
}
