import React from "react";
import { Hammer } from "@phosphor-icons/react";
import { Header } from "../../components/layout/Header";

const ComingSoonPage = ({ title, description }) => (
  <div className="min-h-screen">
    <Header title={title} subtitle={description} />
    <div className="flex h-96 flex-col items-center justify-center text-zinc-500">
      <Hammer weight="duotone" className="mb-4 h-12 w-12" />
      <p className="text-zinc-300">{title} is not built yet</p>
      <p className="mt-1 text-sm">The screen is reserved in the app; content comes next.</p>
    </div>
  </div>
);

export default ComingSoonPage;
