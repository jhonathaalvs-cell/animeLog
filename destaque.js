// Pega o ID da URL (ex: detalhes.html?id=5114)
const params = new URLSearchParams(window.location.search);
const animeId = params.get('id');

window.onload = () => {
    if (animeId) {
        buscarDadosCompletos();
    } else {
        document.getElementById('detalhes-container').innerHTML = "<h2>Anime não encontrado.</h2>";
    }
};

async function buscarDadosCompletos() {
    const container = document.getElementById('detalhes-container');

    try {
        // 1. Busca detalhes do anime
        const res = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/full`);
        const json = await res.json();
        const anime = json.data;

        // 2. Busca elenco (personagens)
        const resChar = await fetch(`https://api.jikan.moe/v4/anime/${animeId}/characters`);
        const jsonChar = await resChar.json();
        const personagens = jsonChar.data.slice(0, 8); // Pega os 8 principais

        container.innerHTML = `
            <div class="detalhes-header">
                <div class="info-principal">
                    <h2>${anime.title}</h2>
                    <div class="tags-meta">
                        <span class="tag-item">⭐ ${anime.score || 'N/A'}</span>
                        <span class="tag-item">📺 ${anime.episodes || '?'} Eps</span>
                        <span class="tag-item">📅 ${anime.year || 'N/A'}</span>
                        <span class="tag-item">${anime.status}</span>
                    </div>
                    
                    <div class="sinopse-box">
                        <h3>Sinopse</h3>
                        <p>${anime.synopsis || 'Sem sinopse disponível.'}</p>
                    </div>

                    <div style="margin-top: 20px;">
                        <strong>Gêneros:</strong> 
                        ${anime.genres.map(g => `<span style="color:var(--cor-primaria); margin-left:10px;">#${g.name}</span>`).join('')}
                    </div>
                </div>

                <div class="video-player">
                    ${anime.trailer.embed_url 
                        ? `<iframe src="${anime.trailer.embed_url}?autoplay=0" allowfullscreen></iframe>`
                        : `<img src="${anime.images.jpg.large_image_url}" style="width:100%; height:100%; object-fit:cover;">`}
                </div>
            </div>

            <div class="secao-secundaria">
                <div class="elenco-box">
                    <h3 style="border-left: 4px solid var(--cor-primaria); padding-left: 10px;">Personagens Principais</h3>
                    <div class="grid-personagens">
                        ${personagens.map(p => `
                            <div class="personagem-card">
                                <img src="${p.character.images.jpg.image_url}" alt="${p.character.name}">
                                <span>${p.character.name}</span>
                                <small style="color: #888;">${p.role}</small>
                            </div>
                        `).join('')}
                    </div>
                </div>

                <div class="mais-infos" style="background: var(--cor-card); padding: 20px; border-radius: 15px; height: fit-content;">
                    <h3 style="color: var(--cor-primaria); margin-bottom: 15px;">Informações Técnicas</h3>
                    <p><strong>Estúdio:</strong> ${anime.studios.map(s => s.name).join(', ')}</p><br>
                    <p><strong>Duração:</strong> ${anime.duration}</p><br>
                    <p><strong>Classificação:</strong> ${anime.rating}</p><br>
                    <p><strong>Popularidade:</strong> #${anime.popularity}</p>
                </div>
            </div>
        `;

    } catch (e) {
        console.error(e);
        container.innerHTML = "<h2>Erro ao carregar detalhes do anime. Tente novamente mais tarde.</h2>";
    }
}