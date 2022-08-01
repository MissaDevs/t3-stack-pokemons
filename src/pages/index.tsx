import type { NextPage } from "next";
import Image from "next/image";
import Link from "next/link";
import { FC, useState } from "react";
import { getOptionsForVote } from "../utils/getRandomPokemons";
import { inferQueryOutput, trpc } from "../utils/trpc";

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

  const voteMutation = trpc.useMutation(["pokemon.cast-vote"]);

  const sendVoteRoundest = (selected: any) => {
    if (selected === first) {
      voteMutation.mutate({ votedFor: first, votedAgainst: second });
    } else {
      voteMutation.mutate({ votedFor: second, votedAgainst: first });
    }

    updateIds(getOptionsForVote());
  };

  const dataLoaded =
    !firstPokemon.isLoading &&
    firstPokemon.data &&
    !secondPokemon.isLoading &&
    secondPokemon.data;

  return (
    <div className="h-screen w-screen flex flex-col justify-between items-center">
      <div className="text-2xl text-center">Which pokemon is Rounder?</div>
      {dataLoaded && (
        <div className="border rounded p-8 flex justify-between items-center max-w-2xl">
          <PokemonListing
            pokemon={firstPokemon.data}
            vote={() => sendVoteRoundest(first)}
          />
          <div className="p-8">VS</div>
          <PokemonListing
            pokemon={secondPokemon.data}
            vote={() => sendVoteRoundest(second)}
          />
          <div className="p-2" />
        </div>
      )}

      {!dataLoaded && <img src="/loading.svg" className="w-48"/>}

      <div className="w-full text-xl text-center pb-2">
        <Link href="/results">
          <a>Results</a>
        </Link>
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
      <Image
        src={`${props.pokemon.spriteUrl}`}
        width={256}
        height={256}
        alt=""
      />
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
