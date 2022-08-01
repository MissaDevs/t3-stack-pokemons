import { GetServerSideProps } from "next";
import Image from "next/image";
import { FC } from "react";
import { AsyncReturnType } from "../utils/ts-bs";

import { prisma } from "../server/db/client";

const getPokemonInOrder = async () => {
  return await prisma.pokemon.findMany({
    orderBy: {
      VoteFor: { _count: "desc" },
    },
    select: {
      id: true,
      name: true,
      spriteUrl: true,
      _count: {
        select: {
          VoteFor: true,
          VoteAgainst: true,
        },
      },
    },
  });
};

type QueryPokemonResult = AsyncReturnType<typeof getPokemonInOrder>;

const generateCountPercentage = (pokemon: QueryPokemonResult[number]) => {
  const { VoteFor, VoteAgainst } = pokemon._count;
  if (VoteFor + VoteAgainst === 0) {
    return 0;
  }
  return (VoteFor / (VoteFor + VoteAgainst)) * 100;
};

const PokemonListing: FC<{ pokemon: QueryPokemonResult[number] }> = ({
  pokemon,
}) => {
  return (
    <div className="flex border-b p-2 items-center justify-between">
      <div className="flex items-center">
        <Image src={`${pokemon.spriteUrl}`} width={64} height={64} alt="" />
        <div className="capitalize">{pokemon.name}</div>
      </div>
      <div className="pr-4">{generateCountPercentage(pokemon).toFixed(2) + "%"}</div>
    </div>
  );
};

const Results: FC<{ pokemon: QueryPokemonResult }> = (props) => {
  return (
    <div className="flex flex-col items-center">
      <h2 className="text-2xl p-4">Results</h2>
      <div className="flex flex-col border max-w-2xl w-full">
        {props.pokemon
          ?.sort(
            (a, b) => generateCountPercentage(b) - generateCountPercentage(a)
          )
          .map((pokemon, index) => (
            <PokemonListing pokemon={pokemon} key={index} />
          ))}
      </div>
    </div>
  );
};

export default Results;

export const getStaticProps: GetServerSideProps = async () => {
  const pokemonOrdered = await getPokemonInOrder();

  return { props: { pokemon: pokemonOrdered }, revalidate: 60 };
};
