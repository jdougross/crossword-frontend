import { useContext } from "react";
import { Clue } from "./types";
import { GameContext } from "./page";
import { theme } from "./utils";
import { Flex, List, Text } from "@chakra-ui/react";

function ClueDisplay({
  // clueListIndex,
  direction: propDirection,
  clueNumber,
  gridIndex,
  text,
}: Clue) {
  const {
    clues,
    direction: contextDirection,
    highlightedClueNumber,
    inputRefs,
    selectedSquare,
    setDirection,
    setSelectedSquare,
  } = useContext(GameContext);

  const backgroundColor =
    clueNumber == highlightedClueNumber && propDirection === contextDirection
      ? theme.color.highlight
      : theme.color.foreground; // weird theming... bg / fg should be different

  function handleClick() {
    setDirection(propDirection);
    setSelectedSquare(gridIndex);
    inputRefs[gridIndex].current?.focus();
  }

  return (
    <Text backgroundColor={backgroundColor} py={8} onClick={handleClick}>
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
        <List width={200} padding={10} key={`list-${listIndex}`}>
          {list.map((clue, index) => (
            <ClueDisplay {...clue} key={`clue-${index}`} />
          ))}
        </List>
      ))}
    </Flex>
  );
}
