import React, { useContext } from "react";
import { Clue } from "./types";
import { GameContext } from "./page";
import { theme } from "./utils";
import { Flex, List, ListItem, Text } from "@chakra-ui/react";

function ClueDisplay({
  clueListIndex,
  direction: propDirection,
  clueNumber,
  gridIndex,
  text,
}: Clue) {
  const {
    clueListRefs,
    direction: contextDirection,
    highlightedClueNumber,
    setDirection,
    selectSquare,
  } = useContext(GameContext);

  const ref = clueListRefs[propDirection][clueListIndex];

  const backgroundColor =
    clueNumber == highlightedClueNumber && propDirection === contextDirection
      ? theme.color.highlight
      : theme.color.foreground; // weird theming... bg / fg should be different

  function handleClick() {
    setDirection(propDirection);
    selectSquare(gridIndex);
  }

  return (
    <Text
      backgroundColor={backgroundColor}
      py={8}
      onClick={handleClick}
      ref={ref}
    >
      {`${clueNumber}. ${text}`}
    </Text>
  );
}

export function ClueLists() {
  const {
    clues: { across, down },
  } = useContext(GameContext);

  return (
    <Flex direction="row">
      {[across, down].map((list, listIndex) => (
        <List
          height={600}
          width={300}
          padding={10}
          key={`list-${listIndex}`}
          overflowY={"scroll"}
        >
          {list.map((clue, index) => (
            <ClueDisplay {...clue} key={`clue-${index}`} />
          ))}
        </List>
      ))}
    </Flex>
  );
}
