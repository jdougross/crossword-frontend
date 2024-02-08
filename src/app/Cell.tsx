import { useContext } from "react";
import { GameContext } from "./page";
import { Cell } from "./types";
import { Box, Flex, Input, Text } from "@chakra-ui/react";
import { fullSize, theme } from "./utils";

export function Blank() {
  return (
    <Box
      borderWidth={theme.border.width}
      borderColor={theme.color.foreground}
      bg={theme.color.foreground}
      {...fullSize}
    />
  );
}

export function CellDisplay({ clues: linkedClues, index }: Cell) {
  const {
    grid,
    gridnums,
    clues,
    direction,
    getNextIndex,
    selectedClueNumber,
    selectedSquare,
    allAnswersRevealed,
    inputRefs,
    selectSquare,
    toggleDirection,
    updateUserInputs,
    userInputs,
  } = useContext(GameContext);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    // TODO: handle rebus
    let inputValue = event.target.value;
    let oldValue = userInputs[index];
    let newValue = event.target.value.slice(-1).toUpperCase();

    if (oldValue.length > 0 /* && not rebus */) {
      newValue = inputValue.replace(oldValue, "").toUpperCase();
    }

    const activeClue = clues[direction].find(
      (clue) => clue.clueNumber === selectedClueNumber,
    );
    const unfinishedCells =
      activeClue?.cells.filter((i) => userInputs[i] === "") || [];
    const atEndOfClue =
      index === activeClue?.cells[activeClue.cells.length - 1];

    // if editing a prior answer, or finishing remainder of clue, don't auto-proceed
    if (
      unfinishedCells.length === 0 ||
      (unfinishedCells.length === 1 && unfinishedCells[0] === index)
    ) {
      !atEndOfClue &&
        selectSquare(
          getNextIndex({ skipFilledCells: false, touchEveryCell: true }),
        );
    } else {
      selectSquare(getNextIndex({}));
    }

    updateUserInputs([[index, newValue]]);
  }

  function handleClick() {
    selectedSquare === index && toggleDirection();
    selectSquare(index);
  }

  function preventKeydownDefaults(event: any) {
    if (
      String(event?.code).includes("Tab") ||
      String(event?.code).includes("Backspace") ||
      String(event?.code).includes("Delete")
    ) {
      event.preventDefault();
    }
  }

  // easier to populate linked clues by clue number than clue list index
  const isHighlighted = selectedClueNumber === linkedClues[direction];

  const cornerLabel = gridnums[index] != 0 ? gridnums[index] : "";

  const backgroundColor = isHighlighted
    ? selectedSquare === index
      ? "#DF0"
      : theme.color.highlight
    : theme.color.background;

  return grid[index] == "." ? (
    <Blank />
  ) : (
    <Flex
      backgroundColor={backgroundColor}
      borderWidth={theme.border.width}
      borderColor={theme.color.foreground}
      direction="column"
      {...fullSize}
    >
      <Box h={"20%"}>
        <Text
          color={theme.color.foreground}
          fontSize={10}
          children={cornerLabel}
        />{" "}
        {/* OK OR NAH? */}
      </Box>
      <Flex w="100%" h="100%" align="center" justify="center">
        {allAnswersRevealed ? (
          <Text color={theme.color.foreground} children={grid[index]} />
        ) : (
          <Input
            w="100%"
            backgroundColor={backgroundColor}
            textAlign={"center"}
            textColor={theme.color.foreground}
            _focusVisible={{ outline: "none", caretColor: "transparent" }}
            value={userInputs[index]}
            ref={inputRefs[index]}
            onChange={handleInputChange}
            onClick={handleClick}
            autoFocus={selectedSquare === index}
            onKeyDown={preventKeydownDefaults}
          />
        )}
      </Flex>
    </Flex>
  );
}
