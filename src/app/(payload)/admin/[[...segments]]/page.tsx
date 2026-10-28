import config from "@payload-config";
import { generatePageMetadata, RootPage } from "@payloadcms/next/views";
import type { Metadata } from "next";

type AdminPageProps = {
  params: Promise<{ segments?: string[] }>;
  searchParams: Promise<Record<string, string | string[]>>;
};

const importMap = {};

export const generateMetadata = ({
  params,
  searchParams,
}: AdminPageProps): Promise<Metadata> =>
  generatePageMetadata({
    config,
    params: params.then(({ segments }) => ({ segments: segments ?? [] })),
    searchParams,
  });

export default async function AdminPage({ params, searchParams }: AdminPageProps) {
  return RootPage({
    config,
    importMap,
    params: params.then(({ segments }) => ({ segments: segments ?? [] })),
    searchParams,
  });
}
