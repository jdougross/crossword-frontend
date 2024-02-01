import { Box, Flex } from "@chakra-ui/react";
import React from "react";
import { GridProps } from "./types";
import { fullSize, theme } from "./utils";

export function GridDisplay({
  size: { rows, cols },
  data,
  renderChildComponent,
}: GridProps) {
  const grid: (typeof renderChildComponent)[][] = [...Array(rows).keys()].map(
    (row) => [...Array(cols).keys()].map((col) => data[row * cols + col]),
  );

  return (
    <Box bg={theme.color.background} {...fullSize}>
      <Flex {...fullSize} direction="column">
        {grid.map((row, indexR) => (
          <Flex {...fullSize} key={`row-${indexR}`}>
            {row.map((element, indexC) =>
              renderChildComponent({
                props: element,
                key: `element-${indexR}:${indexC}`,
              }),
            )}
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}
