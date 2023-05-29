import { Context } from "../../typings.context";

import { Block } from "./typings.block";
import { MULTILINE_BOILERPLATE_SIZE } from "./util.boilerplate-size";

/**
 * takes a fixable block and transform it into a singular string which
 * represents the fixed format of the block.
 */
export function formatBlock(fixable: Block, context: Context): string {
  const whitespace = " ".repeat(context.whitespaceSize);
  const lineStartSize =
    context.whitespaceSize +
    MULTILINE_BOILERPLATE_SIZE +
    (fixable.lineOffsets[0] ?? 0);
  const words = fixable.value.trim().split(" ");

  const newValue = words.reduce(
    (acc, curr) => {
      const lengthIfAdded = acc.currentLineLength + curr.length + 1; // + 1 to act as a final space, i.e. " "

      // We can safely split to a new line in case we are reaching and
      // overflowing line AND if there is at least one word on the current line.
      const splitToNewline =
        lengthIfAdded > context.maxLength &&
        acc.currentLineLength !== lineStartSize;

      if (splitToNewline) {
        const nextLine = `${whitespace} *${" ".repeat(
          fixable.lineOffsets[
            Math.min(acc.currentLineIndex + 1, fixable.lineOffsets.length - 1)
          ] ?? 0
        )} ${curr}`;

        return {
          value: `${acc.value}\n${nextLine}`,
          currentLineLength: nextLine.length,
          currentLineIndex: acc.currentLineIndex + 1,
        };
      } else {
        return {
          value: `${acc.value} ${curr}`,
          currentLineLength: lengthIfAdded,
          currentLineIndex: acc.currentLineIndex,
        };
      }
    },
    {
      value: `${whitespace} *${" ".repeat(fixable.lineOffsets[0] ?? 0)}`,
      currentLineLength: lineStartSize,
      currentLineIndex: 0,
    }
  );

  return newValue.value;
}