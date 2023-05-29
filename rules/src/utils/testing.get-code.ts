import fs from "fs";

import {
  InvalidTestCase,
  ValidTestCase,
} from "@typescript-eslint/utils/dist/ts-eslint";
// eslint-disable-next-line import/no-extraneous-dependencies
import resolve from "enhanced-resolve";

const resolver = resolve.create.sync({
  extensions: [".ts", ".tsx", ".js", ".jsx"],
});

export function getCode<TOpts extends readonly unknown[]>(
  dirname: string,
  name: string,
  options: TOpts
): ValidTestCase<TOpts>;
export function getCode<TIds extends string, TOpts extends readonly unknown[]>(
  dirname: string,
  name: string,
  options: TOpts,
  expectedError: TIds
): InvalidTestCase<TIds, TOpts>;
export function getCode<TIds extends string, TOpts extends readonly unknown[]>(
  dirname: string,
  name: string,
  options: TOpts,
  expectedError?: TIds
): ValidTestCase<TOpts> | InvalidTestCase<TIds, TOpts> {
  const resolvedPath = resolver(dirname, `./${name}`);

  if (!resolvedPath) {
    throw new Error("getCode(): Unable to resolve path");
  }

  const base = {
    code: fs.readFileSync(resolvedPath, "utf-8"),
    filename: resolvedPath,
    options: options,
  };

  if (!expectedError) {
    return base;
  }

  const expectedValuePath = resolver(dirname, `./${name}.expected`);

  if (!expectedValuePath) {
    throw new Error("getCode(): Unable to resolve expected value path");
  }

  return {
    ...base,
    errors: [{ messageId: expectedError }],
    output: fs.readFileSync(expectedValuePath, "utf-8"),
  };
}