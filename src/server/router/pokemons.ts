import { createRouter } from "./context";
import { z } from "zod";

import { PokemonClient } from "pokenode-ts";

import { prisma } from '../db/client'

export const pokeRouter = createRouter()
  .query("getPokemonById", {
    input: z.object({ id: z.number().default(0) }),
    async resolve({ input }) {
      const api = new PokemonClient();

      const pokemon = await api.getPokemonById(input.id);

      return { name: pokemon.name, sprites: pokemon.sprites };
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
          ...input
        }
      })
      
      return { succes: true, vote: voteInDb };
    },
  });
