import { useContext, useEffect, useState } from "react";
import { GameContext } from "./page";
import { Cell, Direction } from "./types";
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

export function CellDisplay({ clues: linkedClues, index, nextIndex }: Cell) {
  const {
    grid,
    gridnums,
    clues,
    direction,
    getNextIndex,
    selectedClueNumber,
    // highlightedSquares,
    selectedSquare,
    allAnswersRevealed,
    inputRefs,

    selectSquare,
    toggleDirection,
    updateUserInput,
    userInputs,
  } = useContext(GameContext);

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newValue = event.target.value.slice(-1).toUpperCase() || "";
    updateUserInput(index, newValue);
    selectSquare(getNextIndex({}));
  }

  function handleClick() {
    selectedSquare === index && toggleDirection();
    selectSquare(index);
  }

  function preventKeydownDefaults(event: any) {
    String(event?.code).includes("Tab") ||
      // String(event?.code).includes("Backspace") ||
      (String(event?.code).includes("Delete") && event.preventDefault());
  }

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
