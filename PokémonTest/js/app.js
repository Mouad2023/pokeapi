document.getElementById('search-button').addEventListener('click', function() {
    const query = document.getElementById('search-input').value.toLowerCase();
    fetch(`https://pokeapi.co/api/v2/pokemon/${query}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Pokémon not found! Please try another name or ID.');
            }
            return response.json();
        })
        .then(pokemon => {
            displayPokemonDetails(pokemon);
            fetchAllPokemonData();
        })
        .catch(error => {
            displayError(error.message);
        });
});

function displayPokemonDetails(pokemon) {
    const detailsSection = document.getElementById('pokemon-details');
    detailsSection.innerHTML = `
        <h2>${pokemon.name.charAt(0).toUpperCase() + pokemon.name.slice(1)}</h2>
        <img src="${pokemon.sprites.front_default}" alt="${pokemon.name}">
        <p>Type(s): ${pokemon.types.map(type => type.type.name).join(', ')}</p>
        <p>Abilities: ${pokemon.abilities.map(ability => ability.ability.name).join(', ')}</p>
        <p>Base Experience: ${pokemon.base_experience}</p>
    `;
}

function displayError(errorMessage) {
    const detailsSection = document.getElementById('pokemon-details');
    detailsSection.innerHTML = `<p class="error">${errorMessage}</p>`;
}

async function fetchAllPokemonData() {
    const allPokemon = [];
    const totalPokemon = 151; 

    for (let i = 1; i <= totalPokemon; i++) {
        const response = await fetch(`https://pokeapi.co/api/v2/pokemon/${i}`);
        const pokemon = await response.json();
        allPokemon.push(pokemon);
    }

    calculateStats(allPokemon);
}

function calculateStats(pokemonList) {
    const typeStats = {};

    pokemonList.forEach(pokemon => {
        const baseExperience = pokemon.base_experience;
        pokemon.types.forEach(type => {
            const typeName = type.type.name;

            if (!typeStats[typeName]) {
                typeStats[typeName] = {
                    totalBaseExperience: 0,
                    uniqueAbilities: new Set(),
                    count: 0
                };
            }

            typeStats[typeName].totalBaseExperience += baseExperience;
            typeStats[typeName].uniqueAbilities.add(...pokemon.abilities.map(ability => ability.ability.name));
            typeStats[typeName].count++;
        });
    });

    const averageBaseExperience = {};
    const uniqueAbilitiesCount = {};

    for (const type in typeStats) {
        averageBaseExperience[type] = typeStats[type].totalBaseExperience / typeStats[type].count;
        uniqueAbilitiesCount[type] = typeStats[type].uniqueAbilities.size;
    }

    displayStats(averageBaseExperience, uniqueAbilitiesCount);
}

function displayStats(averageBaseExperience, uniqueAbilitiesCount) {
    const ctx = document.getElementById('statsChart').getContext('2d');
    const labels = Object.keys(averageBaseExperience);
    const avgBaseExpData = Object.values(averageBaseExperience);
    const uniqueAbilitiesData = Object.values(uniqueAbilitiesCount);

    
    const statsChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [
                {
                    label: 'Average Base Experience',
                    data: avgBaseExpData,
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    borderColor: 'rgba(75, 192, 192, 1)',
                    borderWidth: 1
                },
                {
                    label: 'Unique Abilities Count',
                    data: uniqueAbilitiesData,
                    backgroundColor: 'rgba(153, 102, 255, 0.2)',
                    borderColor: 'rgba(153, 102, 255, 1)',
                    borderWidth: 1
                }
            ]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });

    const statsTable = document.getElementById('stats-table');
    statsTable.innerHTML = `
        <table>
            <thead>
                <tr>
                    <th>Type</th>
                    <th>Average Base Experience</th>
                    <th>Unique Abilities Count</th>
                </tr>
            </thead>
            <tbody>
                ${Object.keys(averageBaseExperience).map(type => `
                    <tr>
                        <td>${type}</td>
                        <td>${averageBaseExperience[type].toFixed(2)}</td>
                        <td>${uniqueAbilitiesCount[type]}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}