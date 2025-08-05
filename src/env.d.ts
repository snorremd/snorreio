import "../.astro/types.d.ts";
import "astro/client";

type Runtime = import("@astrojs/cloudflare").Runtime<Env>;

declare namespace App {
  interface Locals extends Runtime {
    otherLocals: {
      test: string;
    };
  }
}
