import config from "@payload-config";
import { handleServerFunctions, RootLayout } from "@payloadcms/next/layouts";
import type { ReactNode } from "react";
import type { ServerFunctionClientArgs } from "payload";
import { importMap } from "./importMap";

import "@payloadcms/next/css";

const serverFunction = (args: ServerFunctionClientArgs) =>
  handleServerFunctions({ ...args, config, importMap });

export default function PayloadLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <RootLayout
      config={config}
      importMap={importMap}
      serverFunction={serverFunction}
    >
      {children}
    </RootLayout>
  );
}
