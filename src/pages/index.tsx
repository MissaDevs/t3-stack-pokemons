import type { NextPage } from "next";
import Head from "next/head";
import { FC, useState } from "react";
import { getOptionsForVote } from "../utils/getRandomPokemons";
import { inferQueryInput, inferQueryOutput, trpc } from "../utils/trpc";

const btn =
  "inline-flex items-center px-2.5 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:text-gray-500 focus:outline-none focus:shadow-outline focus:border-blue-300 focus:ring-blue-300 focus:ring-opacity-50";

const Home: NextPage = () => {
  const [ids, updateIds] = useState(() => getOptionsForVote());

  const [first, second] = ids;

  const firstPokemon = trpc.useQuery(["pokemon.getPokemonById", { id: first }]);
  const secondPokemon = trpc.useQuery([
    "pokemon.getPokemonById",
    { id: second },
  ]);

  const voteMutation = trpc.useMutation(['pokemon.cast-vote'])

  const sendVoteRoundest = (selected: any) => {
    if (selected === first) {
      voteMutation.mutate({ votedFor: first, votedAgainst: second })
    } else {
      voteMutation.mutate({ votedFor: second, votedAgainst: first })
    }

    updateIds(getOptionsForVote());
  };

  return (
    <div className="h-screen w-screen flex flex-col justify-center items-center">
      <div className="text-2xl text-center">Which pokemon is Rounder?</div>
      <div className="p-2" />
      <div className="border rounded p-8 flex justify-between items-center max-w-2xl">
        {!firstPokemon.isLoading &&
          firstPokemon.data &&
          !secondPokemon.isLoading &&
          secondPokemon.data && (
            <>
              <PokemonListing
                pokemon={firstPokemon.data}
                vote={() => sendVoteRoundest(first)}
              />
              <div className="p-8">VS</div>
              <PokemonListing
                pokemon={secondPokemon.data}
                vote={() => sendVoteRoundest(second)}
              />
            </>
          )}
        <div className="p-2" />
      </div>
    </div>
  );
};

type PokemonFromServer = inferQueryOutput<"pokemon.getPokemonById">;

const PokemonListing: FC<{ pokemon: PokemonFromServer; vote: () => void }> = (
  props
) => {
  return (
    <div className="flex flex-col items-center">
      <img src={props.pokemon.sprites.front_default} className="w-64 h-64" />
      <div className="text-center text-xl capitalize mt-[-2rem]">
        {props.pokemon.name}
      </div>
      <button className={btn} onClick={() => props.vote()}>
        Rounder
      </button>
    </div>
  );
};

export default Home;
