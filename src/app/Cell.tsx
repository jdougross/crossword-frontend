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

export function CellDisplay({ index }: Cell) {
  const {
    grid,
    gridnums,
    // clues,
    size,
    direction,
    highlightedSquares,
    selectedSquare,
    allAnswersRevealed,
    inputRefs,

    setSelectedSquare,
    toggleDirection,
    updateUserInput,
    userInputs,
  } = useContext(GameContext);

  // const [userValue, setUserValue] = useState("");
  // const [userValue, setUserValue] = useState(userInputs[index]);
  const userValue = userInputs[index];

  // should there be a nextIndex: { across: number, down: number }
  // property on each cell, rather than recompute so much?

  function getNextIndex() {
    let topOfClue = -1;
    if (direction === Direction.DOWN) {
      // normal down case, open square below
      if (index + size.cols <= grid.length && grid[index + size.cols] != ".") {
        return index + size.cols;
      }

      topOfClue = index;
      while (topOfClue - size.cols >= 0 && grid[topOfClue] != ".") {
        topOfClue -= size.cols;
      }
    }
    let nextIndex = topOfClue === -1 ? index + 1 : topOfClue + 1;
    // we're not finding the next DOWN clue very well here
    while (grid[nextIndex] == ".") {
      nextIndex++;
    }

    // if we finished the last clue, swap directions and go to the top
    if (nextIndex >= grid.length) {
      toggleDirection();
      nextIndex = nextIndex % grid.length;
    }

    return nextIndex;
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const newValue = event.target.value.slice(-1).toUpperCase() || "";
    updateUserInput(index, newValue);
    // setUserValue(newValue);
    // setUserValue(event.target.value.slice(-1).toUpperCase() || "");
    const nextIndex = getNextIndex();
    // handle edge case of end of puzzle - go back and switch directions
    setSelectedSquare(nextIndex);
    inputRefs[index].current?.blur();
    inputRefs[nextIndex].current?.focus();
  }

  function handleClick() {
    if (selectedSquare == index) {
      toggleDirection();
    } else {
      setSelectedSquare(index);
    }
  }

  function handleFocus() {
    if (document.activeElement == inputRefs[index].current) {
      return;
    }
  }

  const cornerLabel = gridnums[index] != 0 ? gridnums[index] : "";

  const backgroundColor = highlightedSquares.includes(index)
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
            value={userValue}
            ref={inputRefs[index]}
            onChange={handleInputChange}
            onClick={handleClick}
            autoFocus={selectedSquare == index}
            // onFocus={handleFocus}
          />
        )}
      </Flex>
    </Flex>
  );
}
