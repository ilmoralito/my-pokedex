import React, { useState, useEffect } from "react";
import axios from "axios";
import "./App.css";

const ENDPOINT = `https://pokeapi.co/api/v2/pokemon/?limit=10`;

function App() {
  const [search, setSearch] = useState("");
  const [pokemons, setPokemons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchPokemons() {
      setIsLoading(true);

      let response = await axios(ENDPOINT);

      // add detail property
      response = response.data.results.map(item => ({ ...item, detail: {} }));

      setPokemons(response);
      setIsLoading(false);
    }

    fetchPokemons();
  }, []);

  const searchHandler = searchText => setSearch(searchText);

  const collapseHandler = () =>
    setPokemons(pokemons.map(pokemon => ({ ...pokemon, detail: {} })));

  const showDetailHandler = url => {
    getPokemonDetail(url).then(detail =>
      setPokemons(
        pokemons.map(pokemon =>
          pokemon.url === url
            ? Object.keys(pokemon.detail).length > 0
              ? { ...pokemon, detail: {} }
              : {
                  ...pokemon,
                  detail: {
                    name: detail.data.name,
                    order: detail.data.order,
                    sprites: detail.data.sprites
                  }
                }
            : { ...pokemon }
        )
      )
    );
  };

  return (
    <div>
      <PokemonSearch onSearch={searchHandler} />
      {isLoading ? (
        <p>Loading...</p>
      ) : (
        <div>
          <Collapse onCollapse={collapseHandler} />
          <ul>
            {(search
              ? pokemons.filter(pokemon =>
                  pokemon.name.toLowerCase().includes(search)
                )
              : pokemons
            ).map(pokemon => (
              <Pokemon
                key={pokemon.name}
                {...pokemon}
                onShowDetail={showDetailHandler}
              />
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function Collapse({ onCollapse }) {
  return <button onClick={onCollapse}>Collapse</button>;
}

function PokemonSearch({ onSearch }) {
  return (
    <input
      onChange={event => onSearch(event.target.value)}
      placeholder="Enter pokemon name"
    />
  );
}

function Pokemon({ name, url, detail, onShowDetail }) {
  const id = getPokemonId(url);
  const src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

  return (
    <li className="pokemon">
      <figure>
        <img src={src} alt={name} />
        <figcaption>
          <button onClick={() => onShowDetail(url)}>{name}</button>
        </figcaption>
        {Object.keys(detail).length > 0 && <Detail key={url} {...detail} />}
      </figure>
    </li>
  );
}

function Detail({ name, order, sprites }) {
  return (
    <div>
      <table>
        <tbody>
          <tr>
            <td>Name</td>
            <td>{name}</td>
          </tr>
          <tr>
            <td>Order</td>
            <td>{order}</td>
          </tr>
          <tr>
            <td>Sprites</td>
            <td>
              <ul className="sprites">
                {Object.keys(sprites).map(key => (
                  <li>
                    {sprites[key] && <img src={sprites[key]} alt={key} />}
                  </li>
                ))}
              </ul>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function getPokemonId(url) {
  const tokens = url.split("/");

  return tokens[tokens.length - 2];
}

const getPokemonDetail = async url => await axios(url);

export default App;
