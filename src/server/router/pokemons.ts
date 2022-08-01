import { createRouter } from "./context";
import { z } from "zod";

import { PokemonClient } from "pokenode-ts";

import { prisma } from "../db/client";

export const pokeRouter = createRouter()
  .query("getPokemonById", {
    input: z.object({ id: z.number().default(0) }),
    async resolve({ input }) {
      const pokemon = await prisma.pokemon.findFirst({
        where: { id: input.id },
      });

      if (!pokemon) throw new Error("Pokemon not found");
      return pokemon;
    },
  })
  .mutation("cast-vote", {
    input: z.object({
      votedFor: z.number().default(0),
      votedAgainst: z.number().default(0),
    }),
    async resolve({ input }) {
      const voteInDb = await prisma.vote.create({
        data: {
          votedAgainstId: input.votedAgainst,
          votedForId: input.votedFor,
        },
      });

      return { succes: true, vote: voteInDb };
    },
  });
