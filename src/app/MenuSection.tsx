import {
  Button,
  Flex,
  Menu,
  MenuButton,
  MenuItem,
  MenuList,
} from "@chakra-ui/react";

import { theme } from "./utils";
import { useContext } from "react";
import { GameContext } from "./page";

interface MenuProps {
  menuButtonText: string;
  menuItems: Array<MenuListItemProps>;
}

interface MenuListItemProps {
  text: string;
  onClick: () => void;
}

export function GenericMenu(props: MenuProps) {
  const { menuButtonText, menuItems } = props;

  return (
    <Menu>
      <MenuButton
        w={100}
        _hover={{ bg: "gray.400" }}
        _expanded={{ bg: "blue.400" }}
        _focus={{ boxShadow: "outline" }}
      >
        {menuButtonText}
      </MenuButton>
      <MenuList
        display={"flex"}
        flexDirection={"column"}
        bg={theme.color.background}
        textColor={theme.color.foreground}
        w={200}
        p={10}
        borderRadius={10}
      >
        {menuItems.map(({ text, onClick }, i) => (
          <MenuItem
            key={`${text}-${i}`}
            p={10}
            onClick={onClick}
            children={text}
          />
        ))}
      </MenuList>
    </Menu>
  );
}

export function MenuSection(props: {
  checkCells: (i: number[]) => void;
  clearCells: (i: number[]) => void;
  revealCells: (i: number[]) => void;
}) {
  const { checkCells, clearCells, revealCells } = props;

  const { clues, direction, grid, selectedSquare, selectedClueNumber } =
    useContext(GameContext);

  const selectedClue = clues[direction].find(
    (clue) => clue.clueNumber === selectedClueNumber,
  );
  const selectedClueCells = selectedClue?.cells || [];

  return (
    <Flex>
      <Button w={100}>Rebus</Button>

      <GenericMenu
        menuButtonText="Clear"
        menuItems={[
          { text: "Incomplete", onClick: () => {} },
          { text: "Word", onClick: () => clearCells(selectedClueCells) },
          {
            text: "Puzzle",
            onClick: () => clearCells([...Array(grid.length).keys()]),
          },
          { text: "Puzzle & Timer", onClick: () => {} },
        ]}
      />

      <GenericMenu
        menuButtonText="Reveal"
        menuItems={[
          { text: "Square", onClick: () => revealCells([selectedSquare]) },
          { text: "Word", onClick: () => revealCells(selectedClueCells) },
          {
            text: "Puzzle",
            onClick: () => revealCells([...Array(grid.length).keys()]),
          },
        ]}
      />

      <GenericMenu
        menuButtonText="Check"
        menuItems={[
          { text: "Square", onClick: () => checkCells([selectedSquare]) },
          { text: "Word", onClick: () => checkCells(selectedClueCells) },
          {
            text: "Puzzle",
            onClick: () => checkCells([...Array(grid.length).keys()]),
          },
        ]}
      />
    </Flex>
  );
}
