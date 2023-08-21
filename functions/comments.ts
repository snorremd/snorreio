import { BskyAgent } from "@atproto/api";
import { decodeJwt } from "jose";

interface Env {
  KV: KVNamespace;
  ATPROTO_HANDLE: string;
  ATPROTO_PASSWORD: string;
}

interface AuthState {
  refreshToken: string | null;
  refreshTokenExpiresAt: number | null;
  accessToken: string | null;
  accessTokenExpiresAt: number | null;
  isRefreshing: boolean;
}

const authState: AuthState = {
  refreshToken: null,
  refreshTokenExpiresAt: null,
  accessToken: null,
  accessTokenExpiresAt: null,
  isRefreshing: false,
};

const agent = new BskyAgent({ service: "https://bsky.social" });

export const onRequest: PagesFunction<Env> = async (context) => {
  return new Response("Hello, world!!!!!!");
};
